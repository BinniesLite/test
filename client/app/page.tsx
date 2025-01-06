import NonDashboardNavbar from "@/components/non-dashboard-nav";
import Landing from "@/app/(nondashboard)/landing/page";
import Footer from "@/components/footer";

export default function Home() {
  console.log(process.env.NEXT_PUBLIC_API_BASE_URL);

  return (
    <div className="nondashboard-layout">
      <NonDashboardNavbar />
      <main className="nondashboard-layout__main">
        <Landing />
      </main>
      <Footer />
    </div>
  );
}