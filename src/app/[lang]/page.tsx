
import { getDictionary } from "@/lib/get-dictionary";
import { DashboardPageContent } from "@/components/dashboard-client";
import type { Metadata } from 'next';
import type { PageProps } from '@/lib/types';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const dictionary = await getDictionary(params.lang);
  return {
    title: dictionary.navigation.links.dashboard,
    description: dictionary.dashboard.welcome.description,
  };
}


export default async function DashboardPage({
  params: { lang }
}: PageProps) {
  const dictionary = await getDictionary(lang);
  
  if (!dictionary?.dashboard) {
    return <div>Loading translations...</div>;
  }
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
       <h1 className="text-3xl font-bold tracking-tight">{dictionary.dashboard.title}</h1>
       <DashboardPageContent
        dictionary={dictionary.dashboard}
      />
    </div>
  );
}
