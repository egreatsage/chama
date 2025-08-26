import CreateChamaForm from "@/components/chama/CreateChamaForm";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function CreateChamaPage() {
  return (
    <ProtectedRoute>
        <div className="py-8">
            <CreateChamaForm />
        </div>
    </ProtectedRoute>
  );
}