import { useProperty } from "@/context/PropertyContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Home, User, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { properties, apartments, tenants, contracts, getActiveContracts } = useProperty();

  const totalProperties = properties.length;
  const totalApartments = apartments.length;
  const totalTenants = tenants.length;
  const totalContracts = contracts.length;
  const vacantApartments = apartments.filter(apt => !apt.isOccupied).length;
  const activeContracts = getActiveContracts().length;

  const stats = [
    {
      title: "Immobilien",
      value: totalProperties,
      description: "Verwaltete Immobilien",
      icon: <Building className="h-5 w-5" />,
      link: "/properties",
      color: "bg-blue-500"
    },
    {
      title: "Wohnungen",
      value: totalApartments,
      description: `${vacantApartments} verfügbar`,
      icon: <Home className="h-5 w-5" />,
      link: "/apartments",
      color: "bg-green-500"
    },
    {
      title: "Mieter",
      value: totalTenants,
      description: "Registrierte Mieter",
      icon: <User className="h-5 w-5" />,
      link: "/tenants",
      color: "bg-purple-500"
    },
    {
      title: "Verträge",
      value: totalContracts,
      description: `${activeContracts} aktiv`,
      icon: <FileText className="h-5 w-5" />,
      link: "/contracts",
      color: "bg-amber-500"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Überblick über Ihre Hausverwaltung</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link to={stat.link} key={stat.title} className="transition-transform hover:scale-105">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`${stat.color} rounded-full p-2 text-white`}>
                  {stat.icon}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verfügbare Wohnungen</CardTitle>
            <CardDescription>Derzeit freie Wohnungen</CardDescription>
          </CardHeader>
          <CardContent>
            {apartments.filter(apt => !apt.isOccupied).length > 0 ? (
              <div className="space-y-4">
                {apartments
                  .filter(apt => !apt.isOccupied)
                  .map(apartment => {
                    const property = properties.find(p => p.id === apartment.propertyId);
                    return (
                      <div key={apartment.id} className="flex justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-semibold">{property?.name} - Wohnung {apartment.number}</p>
                          <p className="text-sm text-muted-foreground">
                            {apartment.size}m² • {apartment.rooms} Zimmer • {apartment.price}€/Monat
                          </p>
                        </div>
                        <Link
                          to={`/apartments/${apartment.id}`}
                          className="flex h-8 items-center rounded-md bg-primary px-3 text-xs text-primary-foreground"
                        >
                          Details
                        </Link>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-muted-foreground">Alle Wohnungen sind derzeit vermietet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bald ablaufende Verträge</CardTitle>
            <CardDescription>Verträge, die in den nächsten 30 Tagen auslaufen</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const today = new Date();
              const in30Days = new Date();
              in30Days.setDate(today.getDate() + 30);

              const expiringContracts = contracts.filter(contract => {
                if (!contract.endDate) return false;
                const endDate = new Date(contract.endDate);
                return endDate >= today && endDate <= in30Days;
              });

              if (expiringContracts.length > 0) {
                return (
                  <div className="space-y-4">
                    {expiringContracts.map(contract => {
                      const apartment = apartments.find(a => a.id === contract.apartmentId);
                      const tenant = tenants.find(t => t.id === contract.tenantId);
                      return (
                        <div key={contract.id} className="flex justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-semibold">{tenant?.firstName} {tenant?.lastName}</p>
                            <p className="text-sm text-muted-foreground">
                              Wohnung {apartment?.number} • Endet am {contract.endDate}
                            </p>
                          </div>
                          <Link
                            to={`/contracts/${contract.id}`}
                            className="flex h-8 items-center rounded-md bg-primary px-3 text-xs text-primary-foreground"
                          >
                            Details
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                return <p className="text-muted-foreground">Keine Verträge laufen in den nächsten 30 Tagen aus.</p>;
              }
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
