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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Building, Search, Home } from "lucide-react";
import PropertyForm from "@/components/property/PropertyForm";

const Properties = () => {
  const { properties, apartments, getApartmentsByPropertyId } = useProperty();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Filtern der Immobilien basierend auf der Suchquery
  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sortieren nach Name alphabetisch
  const sortedProperties = [...filteredProperties].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Immobilien</h1>
          <p className="text-muted-foreground">Verwalten Sie Ihre Immobilien</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Immobilie hinzufügen
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Neue Immobilie hinzufügen</DialogTitle>
            </DialogHeader>
            <PropertyForm onSuccess={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Immobilien</CardTitle>
          <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Name, Adresse oder Stadt..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedProperties.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Adresse</TableHead>
                  <TableHead>Stadt</TableHead>
                  <TableHead className="text-center">Baujahr</TableHead>
                  <TableHead className="text-center">Wohnungen</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedProperties.map((property) => {
                  const propertyApartments = getApartmentsByPropertyId(property.id);
                  const occupiedCount = propertyApartments.filter(apt => apt.isOccupied).length;

                  return (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {property.name}
                        </div>
                      </TableCell>
                      <TableCell>{property.address}</TableCell>
                      <TableCell>{property.city}</TableCell>
                      <TableCell className="text-center">{property.constructionYear || "–"}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Home className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{occupiedCount}/{property.totalApartments}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          to={`/properties/${property.id}`}
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
              <Building className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Keine Immobilien gefunden</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "Es wurden keine Immobilien gefunden, die Ihren Suchkriterien entsprechen."
                  : "Sie haben noch keine Immobilien hinzugefügt."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Properties;
