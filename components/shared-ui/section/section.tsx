export default function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
    return (
        <section className="space-y-1">
            <div>
                <h3 className="text-lg font-semibold">{title}</h3>
                {description && <p className="text-sm text-gray-600">{description}</p>}
            </div>
            {children}
            <hr className="border-gray-100" />
        </section>
    );
}