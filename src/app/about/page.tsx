// src/app/about/page.tsx
import api from "@/lib/api"

async function getSettings() {
    try {
        const res = await api.get("/settings");
        return res.data;
    } catch (error) {
        return {
            storeName: "YourStore",
        };
    }
}

export default async function AboutPage() {
    const settings = await getSettings()
    const storeName = settings.storeName || "YourStore"

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8 text-center">
                    About {storeName}
                </h1>

                <div className="prose dark:prose-invert prose-lg mx-auto">
                    <p className="lead">
                        Welcome to {storeName} your one-stop destination for premium products at unbeatable prices.
                    </p>

                    <h2 className="mt-12">Our Mission</h2>
                    <p>
                        We believe shopping should be simple, enjoyable, and trustworthy. Our mission is to connect customers with high-quality products from trusted brands, delivered fast and reliably every time.
                    </p>

                    <h2 className="mt-10">What We Offer</h2>
                    <ul>
                        <li>Wide range of categories: Electronics, Fashion, Sports, Beauty, Home & Kitchen, and more</li>
                        <li>Fast & secure checkout with multiple payment options</li>
                        <li>Real customer reviews and ratings</li>
                        <li>Guest checkout + seamless cart merge on login</li>
                        <li>Responsive support and easy returns</li>
                    </ul>

                    <h2 className="mt-10">Why Choose Us?</h2>
                    <p>
                        We're not just another store we're committed to quality, transparency, and customer satisfaction. Every product is carefully selected, and we stand behind what we sell.
                    </p>

                    <div className="mt-12 text-center">
                        <p className="text-xl font-medium text-emerald-600 dark:text-emerald-400">
                            Shop with confidence. Shop with {storeName}.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}