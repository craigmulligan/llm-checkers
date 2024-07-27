import Image from "next/image";
import ModelSelect from "./components/ModelSelect";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-between p-24">
      <ModelSelect />
    </main>
  );
}
