import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import { Link, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, FileText, Home, User, Plus } from "lucide-react";
import { ContractStatus } from "@/models/types";

const Contracts = () => {
  const navigate = useNavigate();
  const { contracts, tenants, apartments, getTenantById, getApartmentById, getPropertyById } = useProperty();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ContractStatus>(ContractStatus.ALL);

  // Filtern der Verträge basierend auf den Suchkriterien
  const filteredContracts = contracts.filter(contract => {
    const tenant = getTenantById(contract.tenantId);
    const apartment = getApartmentById(contract.apartmentId);
    const property = apartment ? getPropertyById(apartment.propertyId) : undefined;

    const searchString = `
      ${tenant?.firstName || ""}
      ${tenant?.lastName || ""}
      ${apartment?.number || ""}
      ${property?.name || ""}
      ${property?.address || ""}
      ${property?.city || ""}
    `.toLowerCase();

    // Suchquery Filter
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    // Status Filter
    const today = new Date();
    const isActive = !contract.endDate || new Date(contract.endDate) >= today;
    const isExpired = contract.endDate && new Date(contract.endDate) < today;

    const matchesStatus =
      statusFilter === ContractStatus.ALL ||
      (statusFilter === ContractStatus.ACTIVE && isActive) ||
      (statusFilter === ContractStatus.EXPIRED && isExpired);

    return matchesSearch && matchesStatus;
  });

  // Sortieren nach Status (aktiv zuerst) und Datum (neueste zuerst)
  const sortedContracts = [...filteredContracts].sort((a, b) => {
    const aIsActive = !a.endDate || new Date(a.endDate) >= new Date();
    const bIsActive = !b.endDate || new Date(b.endDate) >= new Date();

    // Nach Aktivitätsstatus sortieren
    if (aIsActive !== bIsActive) {
      return aIsActive ? -1 : 1;
    }

    // Nach Startdatum sortieren (neuere zuerst)
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mietverträge</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Mietverträge</p>
        </div>
        <Button
          className="flex items-center gap-2"
          onClick={() => navigate('/contracts/new')}
        >
          <Plus className="h-4 w-4" /> Vertrag hinzufügen
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mietverträge</CardTitle>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Mieter, Wohnung oder Immobilie..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as ContractStatus)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ContractStatus.ALL}>Alle Verträge</SelectItem>
                  <SelectItem value={ContractStatus.ACTIVE}>Aktive Verträge</SelectItem>
                  <SelectItem value={ContractStatus.EXPIRED}>Beendete Verträge</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedContracts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mieter</TableHead>
                  <TableHead>Wohnung</TableHead>
                  <TableHead>Beginn</TableHead>
                  <TableHead>Ende</TableHead>
                  <TableHead>Miete</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedContracts.map((contract) => {
                  const tenant = getTenantById(contract.tenantId);
                  const apartment = getApartmentById(contract.apartmentId);
                  const property = apartment ? getPropertyById(apartment.propertyId) : undefined;
                  const isActive = !contract.endDate || new Date(contract.endDate) >= new Date();

                  return (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <Link
                          to={`/tenants/${contract.tenantId}`}
                          className="flex items-center gap-2 hover:underline"
                        >
                          <User className="h-4 w-4 text-muted-foreground" />
                          {tenant ? `${tenant.firstName} ${tenant.lastName}` : "Unbekannt"}
                        </Link>
                      </TableCell>
                      <TableCell>
                        {apartment && (
                          <Link
                            to={`/apartments/${contract.apartmentId}`}
                            className="flex items-center gap-2 hover:underline"
                          >
                            <Home className="h-4 w-4 text-muted-foreground" />
                            {property?.name}, Nr. {apartment.number}
                          </Link>
                        )}
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
                {searchQuery || statusFilter !== ContractStatus.ALL
                  ? "Es wurden keine Verträge gefunden, die Ihren Suchkriterien entsprechen."
                  : "Sie haben noch keine Verträge hinzugefügt."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Contracts;
