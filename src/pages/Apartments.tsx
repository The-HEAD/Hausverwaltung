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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Search, Home, Building } from "lucide-react";

const Apartments = () => {
  const { apartments, properties, getPropertyById } = useProperty();
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filtern der Wohnungen basierend auf den Suchkriterien
  const filteredApartments = apartments.filter(apartment => {
    const property = getPropertyById(apartment.propertyId);
    const searchString = `${apartment.number} ${property?.name} ${property?.address} ${property?.city}`.toLowerCase();

    // Suchquery Filter
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());

    // Immobilien Filter
    const matchesProperty = propertyFilter === "all" || apartment.propertyId === propertyFilter;

    // Status Filter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !apartment.isOccupied) ||
      (statusFilter === "occupied" && apartment.isOccupied);

    return matchesSearch && matchesProperty && matchesStatus;
  });

  // Sortieren nach Immobilie und Wohnungsnummer
  const sortedApartments = [...filteredApartments].sort((a, b) => {
    const propertyA = getPropertyById(a.propertyId)?.name || "";
    const propertyB = getPropertyById(b.propertyId)?.name || "";

    // Zuerst nach Immobilie sortieren
    if (propertyA !== propertyB) {
      return propertyA.localeCompare(propertyB);
    }

    // Dann nach Wohnungsnummer sortieren
    return a.number.localeCompare(b.number, undefined, { numeric: true });
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Wohnungen</h1>
        <p className="text-muted-foreground">Überblick über alle Wohnungen</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Wohnungen</CardTitle>
          <div className="flex flex-col space-y-2 md:flex-row md:items-center md:space-x-2 md:space-y-0">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Suche nach Wohnungsnummer, Immobilie oder Adresse..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex space-x-2">
              <Select
                value={propertyFilter}
                onValueChange={setPropertyFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Immobilie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Immobilien</SelectItem>
                  {properties.map(property => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="available">Verfügbar</SelectItem>
                  <SelectItem value="occupied">Vermietet</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedApartments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Immobilie</TableHead>
                  <TableHead>Nr.</TableHead>
                  <TableHead>Etage</TableHead>
                  <TableHead>Größe</TableHead>
                  <TableHead>Zimmer</TableHead>
                  <TableHead>Preis</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedApartments.map((apartment) => {
                  const property = getPropertyById(apartment.propertyId);

                  return (
                    <TableRow key={apartment.id}>
                      <TableCell>
                        <Link to={`/properties/${apartment.propertyId}`} className="flex items-center gap-2 hover:underline">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          {property?.name}
                        </Link>
                      </TableCell>
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
                      <TableCell className="text-right">
                        <Link
                          to={`/apartments/${apartment.id}`}
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
              <Home className="mb-2 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Keine Wohnungen gefunden</h3>
              <p className="text-sm text-muted-foreground">
                {searchQuery || propertyFilter !== "all" || statusFilter !== "all"
                  ? "Es wurden keine Wohnungen gefunden, die Ihren Suchkriterien entsprechen."
                  : "Sie haben noch keine Wohnungen hinzugefügt."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Apartments;
