import { useState, useEffect } from "react";
import { useProperty } from "@/context/PropertyContext";
import type { Contract } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface ContractFormProps {
  existingContract?: Contract;
  onSuccess?: () => void;
}

const ContractForm = ({ existingContract, onSuccess }: ContractFormProps) => {
  const { addContract, updateContract, apartments, tenants, getPropertyById } = useProperty();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialFormData: Omit<Contract, "id"> = {
    apartmentId: existingContract?.apartmentId || "",
    tenantId: existingContract?.tenantId || "",
    startDate: existingContract?.startDate || new Date().toISOString().split('T')[0],
    endDate: existingContract?.endDate || "",
    rentalPrice: existingContract?.rentalPrice || 0,
    deposit: existingContract?.deposit || 0,
    isPaid: existingContract?.isPaid || false,
    documents: existingContract?.documents || [],
    notes: existingContract?.notes || ""
  };

  const [formData, setFormData] = useState<Omit<Contract, "id">>(initialFormData);

  // Verwendung von URL-Parametern für Vorausfüllung (z.B. bei Aufruf von einer anderen Seite)
  useEffect(() => {
    const apartmentId = searchParams.get('apartmentId');
    const tenantId = searchParams.get('tenantId');

    if (apartmentId && !existingContract) {
      setFormData(prev => ({ ...prev, apartmentId }));

      // Preis der Wohnung als Mietpreis vorschlagen
      const apartment = apartments.find(a => a.id === apartmentId);
      if (apartment) {
        setFormData(prev => ({
          ...prev,
          rentalPrice: apartment.price,
          deposit: apartment.price * 2 // Kaution = 2 Monatsmieten (üblich)
        }));
      }
    }

    if (tenantId && !existingContract) {
      setFormData(prev => ({ ...prev, tenantId }));
    }
  }, [searchParams, apartments, existingContract]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    else if (type === "number") {
      const numValue = value === "" ? 0 : Number.parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Preis der Wohnung als Mietpreis vorschlagen, wenn Wohnung ausgewählt wird
    if (name === "apartmentId") {
      const apartment = apartments.find(a => a.id === value);
      if (apartment) {
        setFormData(prev => ({
          ...prev,
          rentalPrice: apartment.price,
          deposit: apartment.price * 2 // Kaution = 2 Monatsmieten (üblich)
        }));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validierung
      if (!formData.apartmentId || !formData.tenantId || !formData.startDate) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.rentalPrice <= 0) {
        toast({
          title: "Fehler",
          description: "Die Miete muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.deposit < 0) {
        toast({
          title: "Fehler",
          description: "Die Kaution kann nicht negativ sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Datum-Validierung
      const startDate = new Date(formData.startDate);
      if (formData.endDate) {
        const endDate = new Date(formData.endDate);
        if (endDate <= startDate) {
          toast({
            title: "Fehler",
            description: "Das Enddatum muss nach dem Startdatum liegen.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Speichern
      if (existingContract) {
        // Vertrag aktualisieren
        updateContract(existingContract.id, formData);
        toast({
          title: "Vertrag aktualisiert",
          description: "Der Mietvertrag wurde erfolgreich aktualisiert."
        });
      } else {
        // Neuen Vertrag hinzufügen
        addContract(formData);
        toast({
          title: "Vertrag hinzugefügt",
          description: "Der Mietvertrag wurde erfolgreich hinzugefügt."
        });
      }

      // Formular zurücksetzen falls erforderlich
      if (!existingContract) {
        setFormData(initialFormData);
      }

      // Callback aufrufen
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern des Vertrags ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      console.error("Error saving contract:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sortierte Listen für Dropdowns
  const sortedApartments = [...apartments].sort((a, b) => {
    const propertyA = getPropertyById(a.propertyId);
    const propertyB = getPropertyById(b.propertyId);

    if (propertyA && propertyB) {
      if (propertyA.name !== propertyB.name) {
        return propertyA.name.localeCompare(propertyB.name);
      }
    }

    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });

  const sortedTenants = [...tenants].sort((a, b) => {
    const lastNameComparison = a.lastName.localeCompare(b.lastName);
    if (lastNameComparison !== 0) return lastNameComparison;
    return a.firstName.localeCompare(b.firstName);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="apartmentId">
            Wohnung <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.apartmentId}
            onValueChange={(value) => handleSelectChange("apartmentId", value)}
            required
          >
            <SelectTrigger id="apartmentId">
              <SelectValue placeholder="Wählen Sie eine Wohnung" />
            </SelectTrigger>
            <SelectContent>
              {sortedApartments.map((apartment) => {
                const property = getPropertyById(apartment.propertyId);
                return (
                  <SelectItem key={apartment.id} value={apartment.id}>
                    {property ? `${property.name}, ` : ""}
                    Wohnung {apartment.number} ({apartment.size}m²)
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tenantId">
            Mieter <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.tenantId}
            onValueChange={(value) => handleSelectChange("tenantId", value)}
            required
          >
            <SelectTrigger id="tenantId">
              <SelectValue placeholder="Wählen Sie einen Mieter" />
            </SelectTrigger>
            <SelectContent>
              {sortedTenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.lastName}, {tenant.firstName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="startDate">
            Beginn <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate">
            Ende (leer lassen für unbefristeten Vertrag)
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rentalPrice">
            Miete (€/Monat) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rentalPrice"
            name="rentalPrice"
            type="number"
            min="1"
            step="0.01"
            value={formData.rentalPrice}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="deposit">
            Kaution (€) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="deposit"
            name="deposit"
            type="number"
            min="0"
            step="0.01"
            value={formData.deposit}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isPaid"
          name="isPaid"
          checked={formData.isPaid}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isPaid" className="text-sm">
          Kaution wurde bezahlt
        </Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notizen</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Zusätzliche Informationen zum Mietvertrag"
          rows={4}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Wird gespeichert..."
            : existingContract
              ? "Aktualisieren"
              : "Hinzufügen"
          }
        </Button>
      </div>
    </form>
  );
};

export default ContractForm;
