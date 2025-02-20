export default async function Page({
    params,
}: {
    params: Promise<{ chatId: string }>;
}) {
    const { chatId } = await params;
    return <div>ChatId: {chatId}</div>;
}
