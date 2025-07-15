
import { getDictionary } from "@/lib/get-dictionary";
import type { Locale } from "@/i18n-config";
import { getCompanies, getUsers } from "@/services/waste-data-service";
import { CompaniesClient } from "./client-page";
import { auth } from "@/lib/firebase";
import type { Company } from "@/lib/types";

export default async function CompaniesPage({
  params: { lang },
}: {
  params: { lang: Locale };
}) {
  const dictionary = await getDictionary(lang);
  
  // This page is admin-only, so we assume we have an admin user session
  // In a real app, you would get the current user's UID from the session
  const adminUid = auth.currentUser?.uid; // This is illustrative; server components don't have auth context
  
  // Fetch all companies and all clients
  const [allCompanies, allClients] = await Promise.all([
    getCompanies(), 
    getUsers('client')
  ]);

  // Create a map of user IDs to names for easy lookup
  const clientMap = new Map(allClients.map(client => [client.id, client.email]));
  
  // Enhance companies with assigned user names
  const companiesWithClientNames = allCompanies.map(company => ({
      ...company,
      assignedUserName: company.assignedUserUid ? clientMap.get(company.assignedUserUid) : undefined
  }));

  return <CompaniesClient dictionary={dictionary.companiesPage} initialCompanies={companiesWithClientNames} />;
}

    