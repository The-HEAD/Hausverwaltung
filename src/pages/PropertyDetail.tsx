import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProperty } from "@/context/PropertyContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Plus, Home } from "lucide-react";
import PropertyForm from "@/components/property/PropertyForm";
import ApartmentForm from "@/components/apartment/ApartmentForm";

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getPropertyById,
    getApartmentsByPropertyId,
    deleteProperty,
    deleteApartment
  } = useProperty();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddApartmentDialogOpen, setIsAddApartmentDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [apartmentToDelete, setApartmentToDelete] = useState<string | null>(null);

  if (!id) {
    navigate("/properties");
    return null;
  }

  const property = getPropertyById(id);

  if (!property) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Immobilie nicht gefunden</h2>
        <p className="text-muted-foreground">
          Die gesuchte Immobilie konnte nicht gefunden werden.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate("/properties")}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const apartments = getApartmentsByPropertyId(id);
  const occupiedCount = apartments.filter(apt => apt.isOccupied).length;

  // Sortieren nach Wohnungsnummer
  const sortedApartments = [...apartments].sort((a, b) =>
    a.number.localeCompare(b.number, undefined, { numeric: true })
  );

  const handleDeleteProperty = () => {
    const success = deleteProperty(id);

    if (success) {
      toast({
        title: "Immobilie gelöscht",
        description: `Die Immobilie "${property.name}" wurde erfolgreich gelöscht.`
      });
      navigate("/properties");
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Die Immobilie kann nicht gelöscht werden, da noch Wohnungen damit verknüpft sind.",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  };

  const handleDeleteApartment = (apartmentId: string) => {
    const success = deleteApartment(apartmentId);

    if (success) {
      toast({
        title: "Wohnung gelöscht",
        description: "Die Wohnung wurde erfolgreich gelöscht."
      });
      setApartmentToDelete(null);
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Die Wohnung kann nicht gelöscht werden, da noch Verträge damit verknüpft sind.",
        variant: "destructive"
      });
      setApartmentToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-muted-foreground">{property.address}, {property.postalCode} {property.city}</p>
        </div>

        <div className="flex gap-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Bearbeiten
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Immobilie bearbeiten</DialogTitle>
              </DialogHeader>
              <PropertyForm
                existingProperty={property}
                onSuccess={() => setIsEditDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash className="h-4 w-4" /> Löschen
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Immobilie löschen</DialogTitle>
                <DialogDescription>
                  Sind Sie sicher, dass Sie die Immobilie "{property.name}" löschen möchten?
                  Dieser Vorgang kann nicht rückgängig gemacht werden.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Abbrechen
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDeleteProperty}
                >
                  Löschen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Baujahr</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {property.constructionYear || "Nicht angegeben"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Anzahl Wohnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{property.totalApartments}</div>
            <p className="text-xs text-muted-foreground">
              {occupiedCount} von {property.totalApartments} vermietet
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Verfügbare Wohnungen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {property.totalApartments - occupiedCount}
            </div>
            <p className="text-xs text-muted-foreground">
              {(((property.totalApartments - occupiedCount) / property.totalApartments) * 100).toFixed(0)}% verfügbar
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Wohnungen</CardTitle>
            <CardDescription>
              Alle Wohnungen in dieser Immobilie
            </CardDescription>
          </div>
          <Dialog open={isAddApartmentDialogOpen} onOpenChange={setIsAddApartmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Wohnung hinzufügen
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <DialogHeader>
                <DialogTitle>Neue Wohnung hinzufügen</DialogTitle>
              </DialogHeader>
              <ApartmentForm
                propertyId={id}
                onSuccess={() => setIsAddApartmentDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {sortedApartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr.</TableHead>
                  <TableHead>Etage</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Zimmer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApartments.map((apartment) => (
                  <TableRow key={apartment.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        {apartment.number}
                      </div>
                    </TableCell>
                    <TableCell>{apartment.floor}. OG</TableCell>
                    <TableCell>{apartment.size} m²</TableCell>
                    <TableCell>{apartment.rooms} Zimmer</TableCell>
                    <TableCell>{apartment.price} €/Monat</TableCell>
                    <TableCell className="text-center">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                        apartment.isOccupied
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}>
                        {apartment.isOccupied ? "Vermietet" : "Verfügbar"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/apartments/${apartment.id}`)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Dialog open={apartmentToDelete === apartment.id} onOpenChange={(open) => {
                          if (open) {
                            setApartmentToDelete(apartment.id);
                          } else {
                            setApartmentToDelete(null);
                          }
                        }}>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <Trash className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Wohnung löschen</DialogTitle>
                              <DialogDescription>
                                Sind Sie sicher, dass Sie die Wohnung Nr. {apartment.number} löschen möchten?
                                Dieser Vorgang kann nicht rückgängig gemacht werden.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 pt-4">
                              <Button
                                variant="outline"
                                onClick={() => setApartmentToDelete(null)}
                              >
                                Abbrechen
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDeleteApartment(apartment.id)}
                              >
                                Löschen
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Home className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Keine Wohnungen gefunden</h3>
              <p className="text-sm text-muted-foreground">
                Diese Immobilie hat noch keine Wohnungen. Fügen Sie welche hinzu!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyDetail;
