import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import type { Property } from "@/models/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PropertyFormProps {
  existingProperty?: Property;
  onSuccess?: () => void;
}

const PropertyForm = ({ existingProperty, onSuccess }: PropertyFormProps) => {
  const { addProperty, updateProperty } = useProperty();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<Property, "id">>({
    name: existingProperty?.name || "",
    address: existingProperty?.address || "",
    city: existingProperty?.city || "",
    postalCode: existingProperty?.postalCode || "",
    constructionYear: existingProperty?.constructionYear || undefined,
    totalApartments: existingProperty?.totalApartments || 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Werte korrekt parsen
    if (name === "constructionYear" || name === "totalApartments") {
      const numValue = value === "" ? undefined : Number.parseInt(value, 10);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validierung
      if (!formData.name || !formData.address || !formData.city || !formData.postalCode) {
        toast({
          title: "Fehler",
          description: "Bitte füllen Sie alle Pflichtfelder aus.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (
        formData.constructionYear !== undefined &&
        (formData.constructionYear < 1800 || formData.constructionYear > new Date().getFullYear())
      ) {
        toast({
          title: "Fehler",
          description: `Das Baujahr muss zwischen 1800 und ${new Date().getFullYear()} liegen.`,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (formData.totalApartments <= 0) {
        toast({
          title: "Fehler",
          description: "Die Anzahl der Wohnungen muss größer als 0 sein.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Speichern
      if (existingProperty) {
        // Immobilie aktualisieren
        updateProperty(existingProperty.id, formData);
        toast({
          title: "Immobilie aktualisiert",
          description: `Die Immobilie "${formData.name}" wurde erfolgreich aktualisiert.`
        });
      } else {
        // Neue Immobilie hinzufügen
        addProperty(formData);
        toast({
          title: "Immobilie hinzugefügt",
          description: `Die Immobilie "${formData.name}" wurde erfolgreich hinzugefügt.`
        });
      }

      // Formular zurücksetzen falls erforderlich
      if (!existingProperty) {
        setFormData({
          name: "",
          address: "",
          city: "",
          postalCode: "",
          constructionYear: undefined,
          totalApartments: 0
        });
      }

      // Callback aufrufen
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Beim Speichern der Immobilie ist ein Fehler aufgetreten.",
        variant: "destructive"
      });
      console.error("Error saving property:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-2">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="z.B. Stadtpark Residenz"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Adresse <span className="text-red-500">*</span></Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="z.B. Parkstraße 12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">Stadt <span className="text-red-500">*</span></Label>
          <Input
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="z.B. Berlin"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="postalCode">Postleitzahl <span className="text-red-500">*</span></Label>
          <Input
            id="postalCode"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="z.B. 10115"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="constructionYear">Baujahr</Label>
          <Input
            id="constructionYear"
            name="constructionYear"
            type="number"
            min="1800"
            max={new Date().getFullYear()}
            value={formData.constructionYear || ""}
            onChange={handleChange}
            placeholder="z.B. 2010"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalApartments">
            Anzahl der Wohnungen <span className="text-red-500">*</span>
          </Label>
          <Input
            id="totalApartments"
            name="totalApartments"
            type="number"
            min="1"
            value={formData.totalApartments || ""}
            onChange={handleChange}
            placeholder="z.B. 8"
            required
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
            : existingProperty
              ? "Aktualisieren"
              : "Hinzufügen"
          }
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
