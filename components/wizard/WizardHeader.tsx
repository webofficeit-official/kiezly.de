export function WizardHeader({ title, description }: { title: string, description: string }) {
    return (
        <>
            <div className="flex flex-wrap -mx-3 text-center">
                <div className="w-10/12 max-w-full px-3 mx-auto [flex:0_0_auto]">
                    <h5 className="font-semibold text-gray-900 dark:text-white">{title}</h5>
                    <p className="text-gray-500 font-medium">{description}</p>
                </div>
            </div>
        </>
    );
}