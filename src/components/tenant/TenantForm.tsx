import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import type { Tenant } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface TenantFormProps {
  existingTenant?: Tenant;
  onSuccess?: () => void;
}

const TenantForm = ({ existingTenant, onSuccess }: TenantFormProps) => {
  const { addTenant, updateTenant } = useProperty();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Tenant, "id">>({
    firstName: existingTenant?.firstName || "",
    lastName: existingTenant?.lastName || "",
    email: existingTenant?.email || "",
    phone: existingTenant?.phone || "",
    dateOfBirth: existingTenant?.dateOfBirth || "",
    idNumber: existingTenant?.idNumber || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validierung
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // E-Mail-Format validieren
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie eine gültige E-Mail-Adresse ein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Datum validieren, falls eingegeben
      if (formData.dateOfBirth) {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(formData.dateOfBirth)) {
          toast({
            title: "Fehler",
            description: "Bitte geben Sie das Geburtsdatum im Format YYYY-MM-DD ein.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }

        // Prüfen, ob das Datum in der Vergangenheit liegt
        const today = new Date();
        const birthDate = new Date(formData.dateOfBirth);
        if (birthDate > today) {
          toast({
            title: "Fehler",
            description: "Das Geburtsdatum kann nicht in der Zukunft liegen.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Speichern
      if (existingTenant) {
        // Mieter aktualisieren
        updateTenant(existingTenant.id, formData);
        toast({
          title: "Mieter aktualisiert",
          description: `Der Mieter ${formData.firstName} ${formData.lastName} wurde erfolgreich aktualisiert.`
        });
      } else {
        // Neuen Mieter hinzufügen
        addTenant(formData);
        toast({
          title: "Mieter hinzugefügt",
          description: `Der Mieter ${formData.firstName} ${formData.lastName} wurde erfolgreich hinzugefügt.`
        });
      }

      // Formular zurücksetzen falls erforderlich
      if (!existingTenant) {
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dateOfBirth: "",
          idNumber: ""
        });
      }

      // Callback aufrufen
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern des Mieters ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      console.error("Error saving tenant:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">
            Vorname <span className="text-red-500">*</span>
          </Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Max"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">
            Nachname <span className="text-red-500">*</span>
          </Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Mustermann"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">
            E-Mail <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="max.mustermann@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">
            Telefon <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="0170 1234567"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Geburtsdatum</Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            placeholder="YYYY-MM-DD"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">Ausweisnummer / ID</Label>
          <Input
            id="idNumber"
            name="idNumber"
            value={formData.idNumber}
            onChange={handleChange}
            placeholder="z.B. DE123456789"
          />
        </div>
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
            : existingTenant
              ? "Aktualisieren"
              : "Hinzufügen"
          }
        </Button>
      </div>
    </form>
  );
};

export default TenantForm;
