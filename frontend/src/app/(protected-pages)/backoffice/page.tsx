import BackOfficeContent from "./_components/BackofficeContent";
import BackOfficeHeader from "./_components/BackofficeHeader";

export default async function Page() {
    return (
        <main className="py-4">
            <BackOfficeHeader />
            <BackOfficeContent />
        </main>
    )
}
