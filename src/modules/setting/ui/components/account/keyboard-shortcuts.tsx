export default function KeyBoardShortCuts() {
    const keyBoardShortCuts = [
        {
            name: "Search",
            keysCombination: "Ctrl + K",
        },
        {
            name: "New Chat",
            keysCombination: "Ctrl + Shift + K",
        },
        {
            name: "Toggle Sidebar",
            keysCombination: "Ctrl + B",
        },
    ];

    return (
        <div className="space-y-6 rounded-lg bg-card p-4">
            <span className="text-sm font-semibold">Keyboard Shortcuts</span>
            <div className="grid gap-4">
                {keyBoardShortCuts.map((keyBoardShortcut, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between"
                    >
                        <span className="text-sm font-medium">
                            {keyBoardShortcut.name}
                        </span>
                        <div className="flex gap-1">
                            {keyBoardShortcut.keysCombination
                                .split(" + ")
                                .map((key, keyIndex) => (
                                    <kbd
                                        key={keyIndex}
                                        className="rounded bg-background px-2 py-1 font-sans text-sm"
                                    >
                                        {key}
                                    </kbd>
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
