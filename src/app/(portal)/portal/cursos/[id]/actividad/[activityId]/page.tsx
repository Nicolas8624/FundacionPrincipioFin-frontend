import ActividadPage from '@/app/(portal)/portal/actividad/[id]/page';

export const dynamic = 'force-dynamic';

export default async function CourseActivityNestedPage({
  params,
}: {
  params: Promise<{ id: string; activityId: string }>;
}) {
  const { activityId } = await params;
  return <ActividadPage params={Promise.resolve({ id: activityId })} />;
}
