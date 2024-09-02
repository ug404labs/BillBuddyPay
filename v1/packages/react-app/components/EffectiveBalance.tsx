export default function EffectiveBalance({ balance }: { balance: string }) {
    return (
        <div className="flex flex-col items-center gap-y-1">
            <h1 className="text-6xl">{balance}</h1>
            <h2 className="text-xl">cUSD</h2>
        </div>
    );
}
