import React from "react";
import { Link } from "react-router-dom";
import { techCategories } from "../data/techCategories";
import { ArrowRight } from "lucide-react";
import { TechStackLayers } from "../components/TechStackLayers";

export function LandingPage() {
  return (
    <div className="space-y-24 pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 md:pt-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              {techCategories.slice(0, 3).map((category) => (
                <div
                  key={category.id}
                  className={`p-2 rounded-xl ${category.color}`}
                >
                  <category.icon className="w-6 h-6" />
                </div>
              ))}
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Showcase Your Complete
              <br />
              <span className="text-indigo-600">Tech Stack</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              A powerful platform for developers to showcase their technical
              expertise, from languages to deployment tools. Stand out with a
              comprehensive view of your skills.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/auth"
                className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Get Started Free
              </Link>
              <Link
                to="/demo"
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white flex items-center gap-1"
              >
                Live Demo <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Layers */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Your Complete Tech Arsenal
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Explore the full spectrum of development technologies at your
            command
          </p>
        </div>

        <TechStackLayers />
      </section>

      {/* Tech Stack Categories */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Showcase Your Full Stack Expertise
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            From frontend to deployment, demonstrate your mastery across the
            entire development stack.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {techCategories.map((category) => (
            <div
              key={category.id}
              className={`p-6 rounded-2xl transition-transform hover:scale-[1.02] ${category.color}`}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-white/10">
                  <category.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              <p className="text-sm opacity-90">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Built for Modern Developers
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Everything you need to showcase your development journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Interactive Tech Stack",
              description:
                "Showcase your expertise with interactive, categorized technology displays.",
              color: "bg-blue-500/10 text-blue-600",
            },
            {
              title: "Project Timeline",
              description:
                "Display your journey with a beautiful, chronological project timeline.",
              color: "bg-purple-500/10 text-purple-600",
            },
            {
              title: "Skill Analytics",
              description:
                "Visualize your technology proficiency with detailed analytics.",
              color: "bg-green-500/10 text-green-600",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-sm"
            >
              <div className={`p-3 rounded-xl ${feature.color} w-fit mb-4`}>
                <div className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="bg-indigo-600 rounded-3xl p-8 md:p-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Showcase Your Tech Stack?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who use our platform to demonstrate
            their technical expertise and stand out in the industry.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 bg-white text-indigo-600 px-6 py-3 rounded-full font-semibold hover:bg-indigo-50 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
