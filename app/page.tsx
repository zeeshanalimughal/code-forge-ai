import { Sparkles, Zap, Shield, Code2, Rocket, CheckCircle2, ArrowRight, Star, GitBranch, Layout, Palette } from 'lucide-react';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AuthButton } from '@/components/auth-button';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20">
        <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,transparent,black)] dark:bg-grid-slate-800" />
        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 py-20 md:py-28 lg:py-32 text-center">
            <div className="inline-flex items-center rounded-full border bg-background/60 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
              AI-Powered Development Platform
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-5xl">
              Build Beautiful Applications
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                10x Faster with AI
              </span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Transform your ideas into production-ready applications with intelligent code generation, 
              modern UI components, and seamless deployment workflows.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <AuthButton />
              <Button variant="outline" size="lg" className="gap-2">
                <Star className="h-5 w-5" />
                View Demo
              </Button>
            </div>
            <div className="flex items-center gap-8 mt-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Free forever plan</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">10k+</div>
              <div className="text-sm text-muted-foreground mt-1">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">50k+</div>
              <div className="text-sm text-muted-foreground mt-1">Projects Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">99.9%</div>
              <div className="text-sm text-muted-foreground mt-1">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary md:text-4xl">4.9/5</div>
              <div className="text-sm text-muted-foreground mt-1">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
            <Zap className="mr-2 h-4 w-4" />
            Features
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl max-w-3xl">
            Everything you need to build amazing apps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Powerful features designed to accelerate your development workflow
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Code2 className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <CardTitle className="text-xl">AI Code Generation</CardTitle>
              <CardDescription className="text-base">
                Generate production-ready code from natural language descriptions with advanced AI models
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Layout className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Modern UI Components</CardTitle>
              <CardDescription className="text-base">
                Beautiful, accessible components built with Radix UI and Tailwind CSS
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Rocket className="h-6 w-6 text-green-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Instant Deployment</CardTitle>
              <CardDescription className="text-base">
                Deploy your applications to production with a single click
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-red-500/10 rounded-lg">
                  <Shield className="h-6 w-6 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Enterprise Security</CardTitle>
              <CardDescription className="text-base">
                Built-in security features with OAuth, JWT, and encrypted data storage
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <GitBranch className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Version Control</CardTitle>
              <CardDescription className="text-base">
                Integrated Git workflow with branch management and collaboration tools
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="relative overflow-hidden border-2 hover:border-primary transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Palette className="h-6 w-6 text-pink-500" />
                </div>
              </div>
              <CardTitle className="text-xl">Theme Customization</CardTitle>
              <CardDescription className="text-base">
                Fully customizable themes with dark mode and brand color support
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-muted/30 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col items-center gap-4 text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
              How it works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Get started in minutes with our simple three-step process
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up with GitHub</h3>
              <p className="text-muted-foreground">
                Connect your GitHub account in seconds and start building immediately
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Describe Your App</h3>
              <p className="text-muted-foreground">
                Tell our AI what you want to build using natural language
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Deploy & Iterate</h3>
              <p className="text-muted-foreground">
                Review, customize, and deploy your application to production
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="flex flex-col items-center gap-4 text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Loved by developers
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            See what our users are saying about CodeForge AI
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <CardDescription className="text-base">
                &quot;This platform has completely transformed how I build applications. The AI assistance is incredible!&quot;
              </CardDescription>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-muted-foreground">Full Stack Developer</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <CardDescription className="text-base">
                &quot;I&apos;ve built and deployed three projects in the time it would have taken me to set up one manually.&quot;
              </CardDescription>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500" />
                <div>
                  <div className="font-semibold">Michael Chen</div>
                  <div className="text-sm text-muted-foreground">Startup Founder</div>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <CardDescription className="text-base">
                &quot;The code quality is outstanding. It&apos;s like having a senior developer on my team 24/7.&quot;
              </CardDescription>
              <div className="flex items-center gap-3 mt-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-pink-500 to-red-500" />
                <div>
                  <div className="font-semibold">Emily Rodriguez</div>
                  <div className="text-sm text-muted-foreground">Freelance Developer</div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl max-w-3xl">
              Ready to build something amazing?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Join thousands of developers who are already building the future with AI
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <AuthButton />
              <Button variant="outline" size="lg" className="gap-2">
                Learn More
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
