import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import type { Apartment } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface ApartmentFormProps {
  propertyId: string;
  existingApartment?: Apartment;
  onSuccess?: () => void;
}

const ApartmentForm = ({ propertyId, existingApartment, onSuccess }: ApartmentFormProps) => {
  const { addApartment, updateApartment } = useProperty();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Apartment, "id">>({
    propertyId: propertyId,
    number: existingApartment?.number || "",
    floor: existingApartment?.floor || 0,
    size: existingApartment?.size || 0,
    rooms: existingApartment?.rooms || 1,
    bathrooms: existingApartment?.bathrooms || 1,
    price: existingApartment?.price || 0,
    isOccupied: existingApartment?.isOccupied || false,
    amenities: existingApartment?.amenities || []
  });

  const [amenitiesInput, setAmenitiesInput] = useState(
    existingApartment?.amenities.join(", ") || ""
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (name === "amenitiesInput") {
      setAmenitiesInput(value);
      // Parse amenities from comma-separated list
      const amenitiesList = value
        .split(",")
        .map(item => item.trim())
        .filter(item => item !== "");

      setFormData(prev => ({ ...prev, amenities: amenitiesList }));
    }
    else if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    }
    else if (type === "number") {
      // Convert value to number
      const numValue = value === "" ? 0 : Number.parseFloat(value);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validierung
      if (!formData.number) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie eine Wohnungsnummer ein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.size <= 0) {
        toast({
          title: "Fehler",
          description: "Die Wohnungsgröße muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.rooms <= 0) {
        toast({
          title: "Fehler",
          description: "Die Anzahl der Zimmer muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.bathrooms <= 0) {
        toast({
          title: "Fehler",
          description: "Die Anzahl der Badezimmer muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.price <= 0) {
        toast({
          title: "Fehler",
          description: "Der Mietpreis muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Speichern
      if (existingApartment) {
        // Wohnung aktualisieren
        updateApartment(existingApartment.id, formData);
        toast({
          title: "Wohnung aktualisiert",
          description: `Die Wohnung Nr. ${formData.number} wurde erfolgreich aktualisiert.`
        });
      } else {
        // Neue Wohnung hinzufügen
        addApartment(formData);
        toast({
          title: "Wohnung hinzugefügt",
          description: `Die Wohnung Nr. ${formData.number} wurde erfolgreich hinzugefügt.`
        });
      }

      // Formular zurücksetzen falls erforderlich
      if (!existingApartment) {
        setFormData({
          propertyId: propertyId,
          number: "",
          floor: 0,
          size: 0,
          rooms: 1,
          bathrooms: 1,
          price: 0,
          isOccupied: false,
          amenities: []
        });
        setAmenitiesInput("");
      }

      // Callback aufrufen
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern der Wohnung ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      console.error("Error saving apartment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="number">
            Wohnungsnummer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="number"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="z.B. 101"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="floor">
            Etage <span className="text-red-500">*</span>
          </Label>
          <Input
            id="floor"
            name="floor"
            type="number"
            min="0"
            value={formData.floor}
            onChange={handleChange}
            placeholder="z.B. 1"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="size">
            Größe (m²) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="size"
            name="size"
            type="number"
            min="1"
            step="0.1"
            value={formData.size}
            onChange={handleChange}
            placeholder="z.B. 65.5"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">
            Miete (€/Monat) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="1"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            placeholder="z.B. 850"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">
            Anzahl Zimmer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rooms"
            name="rooms"
            type="number"
            min="1"
            value={formData.rooms}
            onChange={handleChange}
            placeholder="z.B. 3"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bathrooms">
            Anzahl Badezimmer <span className="text-red-500">*</span>
          </Label>
          <Input
            id="bathrooms"
            name="bathrooms"
            type="number"
            min="1"
            value={formData.bathrooms}
            onChange={handleChange}
            placeholder="z.B. 1"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="amenitiesInput">Ausstattung (durch Komma getrennt)</Label>
        <Textarea
          id="amenitiesInput"
          name="amenitiesInput"
          value={amenitiesInput}
          onChange={handleChange}
          placeholder="z.B. Balkon, Keller, Aufzug, Einbauküche"
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2 pt-2">
        <input
          type="checkbox"
          id="isOccupied"
          name="isOccupied"
          checked={formData.isOccupied}
          onChange={handleChange}
          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
        />
        <Label htmlFor="isOccupied" className="text-sm">
          Wohnung ist bereits vermietet
        </Label>
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
            : existingApartment
              ? "Aktualisieren"
              : "Hinzufügen"
          }
        </Button>
      </div>
    </form>
  );
};

export default ApartmentForm;
