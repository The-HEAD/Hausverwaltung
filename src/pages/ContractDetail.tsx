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
import { useToast } from "@/hooks/use-toast";
import { Edit, Trash, Building, Home, User } from "lucide-react";
import ContractForm from "@/components/contract/ContractForm";

const ContractDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getContractById,
    getTenantById,
    getApartmentById,
    getPropertyById,
    deleteContract
  } = useProperty();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!id) {
    navigate("/contracts");
    return null;
  }

  const contract = getContractById(id);

  if (!contract) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Vertrag nicht gefunden</h2>
        <p className="text-muted-foreground">
          Der gesuchte Vertrag konnte nicht gefunden werden.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate("/contracts")}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const tenant = getTenantById(contract.tenantId);
  const apartment = getApartmentById(contract.apartmentId);
  const property = apartment ? getPropertyById(apartment.propertyId) : undefined;

  const isActive = !contract.endDate || new Date(contract.endDate) >= new Date();

  const handleDeleteContract = () => {
    const success = deleteContract(id);

    if (success) {
      toast({
        title: "Vertrag gelöscht",
        description: "Der Mietvertrag wurde erfolgreich gelöscht."
      });
      navigate("/contracts");
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Der Vertrag konnte nicht gelöscht werden.",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold">Mietvertrag</h1>
            <div className="flex items-center gap-2">
              {tenant && (
                <Link
                  to={`/tenants/${tenant.id}`}
                  className="flex items-center gap-1 rounded-lg text-muted-foreground hover:text-foreground"
                >
                  <User className="h-4 w-4" />
                  <span>{tenant.firstName} {tenant.lastName}</span>
                </Link>
              )}
              <span className="text-muted-foreground">/</span>
              {apartment && property && (
                <>
                  <Link
                    to={`/properties/${property.id}`}
                    className="flex items-center gap-1 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Building className="h-4 w-4" />
                    <span>{property.name}</span>
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <Link
                    to={`/apartments/${apartment.id}`}
                    className="flex items-center gap-1 rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    <Home className="h-4 w-4" />
                    <span>Wohnung {apartment.number}</span>
                  </Link>
                </>
              )}
            </div>
          </div>
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
                <DialogTitle>Vertrag bearbeiten</DialogTitle>
              </DialogHeader>
              <ContractForm
                existingContract={contract}
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
                <DialogTitle>Vertrag löschen</DialogTitle>
                <DialogDescription>
                  Sind Sie sicher, dass Sie diesen Mietvertrag löschen möchten?
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
                  onClick={handleDeleteContract}
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
                isActive
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}>
                {isActive ? "Aktiv" : "Beendet"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Laufzeit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Beginn:</span>
                <span className="font-medium">{new Date(contract.startDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ende:</span>
                <span className="font-medium">
                  {contract.endDate
                    ? new Date(contract.endDate).toLocaleDateString()
                    : "Unbefristet"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Miete</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.rentalPrice} €</div>
            <p className="text-xs text-muted-foreground">pro Monat</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Kaution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contract.deposit} €</div>
            <div className="mt-1 flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-full ${contract.isPaid ? "bg-green-500" : "bg-red-500"}`}></div>
              <p className="text-xs text-muted-foreground">
                {contract.isPaid ? "Bezahlt" : "Nicht bezahlt"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {contract.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{contract.notes}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Mieter</CardTitle>
          </CardHeader>
          <CardContent>
            {tenant ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{tenant.firstName} {tenant.lastName}</h3>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">E-Mail:</span>
                      <a href={`mailto:${tenant.email}`} className="hover:underline">{tenant.email}</a>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Telefon:</span>
                      <a href={`tel:${tenant.phone}`} className="hover:underline">{tenant.phone}</a>
                    </div>
                    {tenant.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Geburtsdatum:</span>
                        <span>{new Date(tenant.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/tenants/${tenant.id}`)}
                >
                  Zum Mieterprofil
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Mieter nicht gefunden</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wohnung</CardTitle>
          </CardHeader>
          <CardContent>
            {apartment && property ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <h3 className="font-semibold">{property.name} - Wohnung {apartment.number}</h3>
                  <div className="flex flex-col gap-1 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Adresse:</span>
                      <span>{property.address}, {property.postalCode} {property.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Größe:</span>
                      <span>{apartment.size} m²</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Zimmer:</span>
                      <span>{apartment.rooms} Zimmer, {apartment.bathrooms} Bad</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/apartments/${apartment.id}`)}
                >
                  Zur Wohnungsansicht
                </Button>
              </div>
            ) : (
              <p className="text-muted-foreground">Wohnung nicht gefunden</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContractDetail;
