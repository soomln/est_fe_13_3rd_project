import CompanyShell from '@/app/search-companies/detail/_components/CompanyShell';

export default async function CompanyDetailLayout({ children, params }) {
  const { companySlug } = await params;

  return <CompanyShell companySlug={companySlug}>{children}</CompanyShell>;
}
