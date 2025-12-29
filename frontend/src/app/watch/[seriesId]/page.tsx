import SeriesPlayer from '@/components/player/SeriesPlayer';

export default async function WatchPage(props: { params: Promise<{ seriesId: string }> }) {
    const params = await props.params;
    return <SeriesPlayer seriesId={params.seriesId} />;
}
