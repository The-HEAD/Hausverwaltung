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
import { Edit, Trash, Plus, Building, Home, FileText } from "lucide-react";
import TenantForm from "@/components/tenant/TenantForm";

const TenantDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    getTenantById,
    deleteTenant,
    getContractsByTenantId,
    getApartmentById
  } = useProperty();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  if (!id) {
    navigate("/tenants");
    return null;
  }

  const tenant = getTenantById(id);

  if (!tenant) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Mieter nicht gefunden</h2>
        <p className="text-muted-foreground">
          Der gesuchte Mieter konnte nicht gefunden werden.
        </p>
        <Button
          className="mt-4"
          onClick={() => navigate("/tenants")}
        >
          Zurück zur Übersicht
        </Button>
      </div>
    );
  }

  const contracts = getContractsByTenantId(id);

  // Sortieren der Verträge nach Startdatum (neueste zuerst)
  const sortedContracts = [...contracts].sort((a, b) =>
    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  // Aktuelle Verträge zuerst anzeigen
  const activeContracts = sortedContracts.filter(c => !c.endDate || new Date(c.endDate) >= new Date());
  const expiredContracts = sortedContracts.filter(c => c.endDate && new Date(c.endDate) < new Date());
  const orderedContracts = [...activeContracts, ...expiredContracts];

  const handleDeleteTenant = () => {
    const success = deleteTenant(id);

    if (success) {
      toast({
        title: "Mieter gelöscht",
        description: `Der Mieter ${tenant.firstName} ${tenant.lastName} wurde erfolgreich gelöscht.`
      });
      navigate("/tenants");
    } else {
      toast({
        title: "Fehler beim Löschen",
        description: "Der Mieter kann nicht gelöscht werden, da noch Verträge damit verknüpft sind.",
        variant: "destructive"
      });
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{tenant.firstName} {tenant.lastName}</h1>
          <p className="text-muted-foreground">{tenant.email} • {tenant.phone}</p>
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
                <DialogTitle>Mieter bearbeiten</DialogTitle>
              </DialogHeader>
              <TenantForm
                existingTenant={tenant}
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
                <DialogTitle>Mieter löschen</DialogTitle>
                <DialogDescription>
                  Sind Sie sicher, dass Sie den Mieter {tenant.firstName} {tenant.lastName} löschen möchten?
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
                  onClick={handleDeleteTenant}
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
            <CardTitle className="text-sm font-medium">Kontaktinformationen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">E-Mail:</p>
                <p>
                  <a href={`mailto:${tenant.email}`} className="hover:underline">
                    {tenant.email}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefon:</p>
                <p>
                  <a href={`tel:${tenant.phone}`} className="hover:underline">
                    {tenant.phone}
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Persönliche Daten</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tenant.dateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">Geburtsdatum:</p>
                  <p>{new Date(tenant.dateOfBirth).toLocaleDateString()}</p>
                </div>
              )}
              {tenant.idNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Ausweisnummer / ID:</p>
                  <p>{tenant.idNumber}</p>
                </div>
              )}
              {!tenant.dateOfBirth && !tenant.idNumber && (
                <p className="text-muted-foreground">Keine persönlichen Daten hinterlegt</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Aktive Verträge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
            <p className="text-xs text-muted-foreground">
              Gesamt: {contracts.length} {contracts.length === 1 ? "Vertrag" : "Verträge"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Mietverträge</CardTitle>
            <CardDescription>
              Alle Mietverträge dieses Mieters
            </CardDescription>
          </div>
          <Button
            className="flex items-center gap-2"
            onClick={() => navigate(`/contracts/new?tenantId=${id}`)}
          >
            <Plus className="h-4 w-4" /> Vertrag hinzufügen
          </Button>
        </CardHeader>
        <CardContent>
          {orderedContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Immobilie</TableHead>
                  <TableHead>Wohnung</TableHead>
                  <TableHead>Beginn</TableHead>
                  <TableHead>Ende</TableHead>
                  <TableHead>Miete</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderedContracts.map((contract) => {
                  const apartment = getApartmentById(contract.apartmentId);
                  const isActive = !contract.endDate || new Date(contract.endDate) >= new Date();

                  if (!apartment) return null;

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link
                          to={`/properties/${apartment.propertyId}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {apartment.propertyId}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/apartments/${apartment.id}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <Home className="h-4 w-4 text-muted-foreground" />
                          {apartment.number}
                        </Link>
                      </TableCell>
                      <TableCell>{new Date(contract.startDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {contract.endDate
                          ? new Date(contract.endDate).toLocaleDateString()
                          : "Unbefristet"}
                      </TableCell>
                      <TableCell>{contract.rentalPrice} €/Monat</TableCell>
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
                Dieser Mieter hat noch keine Mietverträge. Fügen Sie einen neuen Vertrag hinzu!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TenantDetail;
