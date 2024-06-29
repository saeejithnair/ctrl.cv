import CtrlCvApp from "~/components/CtrlCvApp";

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center text-blue-600 mb-2">ctrl.cv</h1>
      <p className="text-center text-gray-600 mb-8">copy repos, paste knowledge</p>
      <CtrlCvApp />
    </main>
  );
}