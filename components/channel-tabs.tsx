"use client";

// Selector de canal del dashboard: tabs con el ícono de cada fuente. Al
// elegir una, navega a "?channel=X" (preservando "q") para que el dashboard
// muestre los datos de ese canal.
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SiWhatsapp, SiMessenger, SiInstagram } from "react-icons/si";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const channels = [
  { value: "WHATSAPP", label: "WhatsApp", icon: SiWhatsapp },
  { value: "MESSENGER", label: "Messenger", icon: SiMessenger },
  { value: "INSTAGRAM", label: "Instagram", icon: SiInstagram },
];

export function ChannelTabs() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeChannel = searchParams.get("channel");

  function handleValueChange(value: unknown) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set("channel", value as string);
    else params.delete("channel");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <Tabs value={activeChannel} onValueChange={handleValueChange}>
      <TabsList>
        {channels.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value}>
            <Icon />
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
