import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContractForm from "@/components/contract/ContractForm";

const ContractNew = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Neuen Mietvertrag erstellen</h1>
        <p className="text-muted-foreground">Fügen Sie einen neuen Mietvertrag hinzu</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vertragsdetails</CardTitle>
          <CardDescription>
            Füllen Sie die Vertragsdetails aus
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContractForm
            onSuccess={() => navigate("/contracts")}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ContractNew;
