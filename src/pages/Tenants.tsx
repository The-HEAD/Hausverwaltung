import { useState } from "react";
import { useProperty } from "@/context/PropertyContext";
import { Link } from "react-router-dom";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, FileText } from "lucide-react";
import TenantForm from "@/components/tenant/TenantForm";

const Tenants = () => {
  const { tenants, getContractsByTenantId } = useProperty();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filtern der Mieter basierend auf der Suchquery
  const filteredTenants = tenants.filter(tenant => {
    const searchString = `${tenant.firstName} ${tenant.lastName} ${tenant.email} ${tenant.phone}`.toLowerCase();
    return searchString.includes(searchQuery.toLowerCase());
  });

  // Sortieren nach Nachname, dann Vorname
  const sortedTenants = [...filteredTenants].sort((a, b) => {
    const lastNameComparison = a.lastName.localeCompare(b.lastName);
    if (lastNameComparison !== 0) return lastNameComparison;
    return a.firstName.localeCompare(b.firstName);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mieter</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Mieter</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Mieter hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Neuen Mieter hinzufügen</DialogTitle>
            </DialogHeader>
            <TenantForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Mieter</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Name, E-Mail oder Telefonnummer..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedTenants.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead className="text-center">Aktive Verträge</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTenants.map((tenant) => {
                  const contracts = getContractsByTenantId(tenant.id);
                  const activeContracts = contracts.filter(
                    c => !c.endDate || new Date(c.endDate) >= new Date()
                  );

                  return (
                    <TableRow key={tenant.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {tenant.firstName} {tenant.lastName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`mailto:${tenant.email}`}
                          className="hover:underline"
                        >
                          {tenant.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <a
                          href={`tel:${tenant.phone}`}
                          className="hover:underline"
                        >
                          {tenant.phone}
                        </a>
                      </TableCell>
                      <TableCell className="text-center">
                        {activeContracts.length > 0 ? (
                          <span className="flex items-center justify-center gap-1 rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                            <FileText className="h-3 w-3" />
                            {activeContracts.length}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Keine</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/tenants/${tenant.id}`}
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
              <User className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Keine Mieter gefunden</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Es wurden keine Mieter gefunden, die Ihren Suchkriterien entsprechen."
                  : "Sie haben noch keine Mieter hinzugefügt."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Tenants;
