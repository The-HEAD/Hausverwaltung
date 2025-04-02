import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
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
import { Edit, Trash, Plus, Home, Building, FileText, User } from "lucide-react";
import ApartmentForm from "@/components/apartment/ApartmentForm";

const ApartmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getApartmentById,
    getPropertyById,
    deleteApartment,
    getContractsByApartmentId,
    getTenantById
  } = useProperty();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!id) {
    navigate("/apartments");
    return null;
  }

  const apartment = getApartmentById(id);

  if (!apartment) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Wohnung nicht gefunden</h2>
        <p className="text-muted-foreground">
          Die gesuchte Wohnung konnte nicht gefunden werden.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate("/apartments")}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const property = getPropertyById(apartment.propertyId);
  const contracts = getContractsByApartmentId(id);

  // Sortieren der Verträge nach Startdatum (neueste zuerst)
  const sortedContracts = [...contracts].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Aktuelle Verträge zuerst anzeigen
  const activeContracts = sortedContracts.filter(c => !c.endDate || new Date(c.endDate) >= new Date());
  const expiredContracts = sortedContracts.filter(c => c.endDate && new Date(c.endDate) < new Date());
  const orderedContracts = [...activeContracts, ...expiredContracts];

  const handleDeleteApartment = () => {
    const success = deleteApartment(id);

    if (success) {
      toast({
        title: "Wohnung gelöscht",
        description: `Die Wohnung Nr. ${apartment.number} wurde erfolgreich gelöscht.`
      });
      navigate("/apartments");
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Die Wohnung kann nicht gelöscht werden, da noch Verträge damit verknüpft sind.",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link
              to={`/properties/${apartment.propertyId}`}
              className="flex items-center gap-1 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <Building className="h-4 w-4" />
              {property?.name}
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-3xl font-bold">Wohnung {apartment.number}</h1>
          </div>

          <p className="text-muted-foreground">{property?.address}, {property?.postalCode} {property?.city}</p>
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
                <DialogTitle>Wohnung bearbeiten</DialogTitle>
              </DialogHeader>
              <ApartmentForm
                propertyId={apartment.propertyId}
                existingApartment={apartment}
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
                <DialogTitle>Wohnung löschen</DialogTitle>
                <DialogDescription>
                  Sind Sie sicher, dass Sie die Wohnung Nr. {apartment.number} löschen möchten?
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
                  onClick={handleDeleteApartment}
                >
                  Löschen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                apartment.isOccupied
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {apartment.isOccupied ? "Vermietet" : "Verfügbar"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Größe & Zimmer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartment.size} m²</div>
            <p className="text-xs text-muted-foreground">
              {apartment.rooms} Zimmer • {apartment.bathrooms} Badezimmer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Etage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartment.floor}. OG</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mietpreis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{apartment.price} €</div>
            <p className="text-xs text-muted-foreground">pro Monat</p>
          </CardContent>
        </Card>
      </div>

      {apartment.amenities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Ausstattung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {apartment.amenities.map((amenity, index) => (
                <span
                  key={index}
                  className="inline-flex rounded-full bg-secondary px-3 py-1 text-sm"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mietverträge</CardTitle>
            <CardDescription>
              Alle Mietverträge für diese Wohnung
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(`/contracts/new?apartmentId=${id}`)}
          >
            <Plus className="h-4 w-4" /> Vertrag hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {orderedContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mieter</TableHead>
                  <TableHead>Beginn</TableHead>
                  <TableHead>Ende</TableHead>
                  <TableHead>Miete</TableHead>
                  <TableHead>Kaution</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedContracts.map((contract) => {
                  const tenant = getTenantById(contract.tenantId);
                  const isActive = !contract.endDate || new Date(contract.endDate) >= new Date();

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link
                          to={`/tenants/${contract.tenantId}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          {tenant?.firstName} {tenant?.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString()
                          : "Unbefristet"}
                      </TableCell>
                      <TableCell>{contract.rentalPrice} €/Monat</TableCell>
                      <TableCell>{contract.deposit} €</TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                          isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {isActive ? "Aktiv" : "Beendet"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/contracts/${contract.id}`}
                          className="flex h-8 items-center justify-center rounded-md bg-primary px-3 text-xs text-primary-foreground"
                        >
                          Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <FileText className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Keine Verträge gefunden</h3>
              <p className="text-sm text-muted-foreground">
                Diese Wohnung hat noch keine Mietverträge. Fügen Sie einen neuen Vertrag hinzu!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApartmentDetail;
