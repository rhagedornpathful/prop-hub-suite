import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building, Home, Users, Wrench, DollarSign, FileText } from 'lucide-react';

/**
 * Responsive Showcase Component
 * Demonstrates all the mobile-first responsive utilities and patterns
 */
export const ResponsiveShowcase = () => {
  return (
    <div className="min-h-screen bg-gradient-subtle overflow-safe">
      {/* Mobile-First Header */}
      <header className="bg-card border-b border-border section-padding sticky top-0 z-10">
        <div className="container-responsive">
          <div className="mobile-stack items-start md:items-center">
            <h1 className="text-responsive-xl font-bold text-foreground">
              Responsive Design Showcase
            </h1>
            <p className="text-responsive-lg text-muted-foreground">
              Mobile-first design patterns and utilities
            </p>
          </div>
        </div>
      </header>

      <main className="section-padding space-y-8">
        <div className="container-responsive space-y-8">
          {/* Grid System Examples */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Grid Systems</h2>
            
            {/* 4-Column Responsive Grid */}
            <div className="grid-responsive-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="shadow-md border-0">
                  <CardContent className="section-padding text-center">
                    <Building className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-medium">Grid Item {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Responsive grid that stacks on mobile
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 3-Column Responsive Grid */}
            <div className="grid-responsive-3 mb-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="shadow-md border-0">
                  <CardContent className="section-padding text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-secondary" />
                    <h3 className="font-medium">3-Col Item {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Three columns on desktop, 2 on tablet, 1 on mobile
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 2-Column Responsive Grid */}
            <div className="grid-responsive-2">
              {[...Array(2)].map((_, i) => (
                <Card key={i} className="shadow-md border-0">
                  <CardContent className="section-padding text-center">
                    <Wrench className="h-8 w-8 mx-auto mb-2 text-accent" />
                    <h3 className="font-medium">2-Col Item {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      Two columns on tablet and up, 1 on mobile
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Flex Layout Examples */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Flex Layouts</h2>
            
            <Card className="shadow-md border-0">
              <CardHeader>
                <CardTitle>Mobile Stack Layout</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mobile-stack">
                  <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
                    <Home className="h-6 w-6 text-primary" />
                    <div>
                      <h4 className="font-medium">Primary Item</h4>
                      <p className="text-sm text-muted-foreground">Stacks vertically on mobile</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
                    <DollarSign className="h-6 w-6 text-success" />
                    <div>
                      <h4 className="font-medium">Secondary Item</h4>
                      <p className="text-sm text-muted-foreground">Horizontal on tablet+</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-muted/50 p-4 rounded-lg">
                    <FileText className="h-6 w-6 text-accent" />
                    <div>
                      <h4 className="font-medium">Third Item</h4>
                      <p className="text-sm text-muted-foreground">Responsive spacing</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Typography Examples */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Responsive Typography</h2>
            
            <Card className="shadow-md border-0">
              <CardContent className="section-padding space-y-4">
                <div>
                  <h3 className="text-responsive-xl font-bold text-foreground">
                    Responsive XL Heading
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Scales from xl → 2xl → 3xl across breakpoints
                  </p>
                </div>
                <div>
                  <h4 className="text-responsive-lg font-semibold text-foreground">
                    Responsive Large Text
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Scales from lg → xl → 2xl across breakpoints
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Button and Touch Targets */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Touch-Friendly Components</h2>
            
            <Card className="shadow-md border-0">
              <CardContent className="section-padding">
                <div className="mobile-stack">
                  <Button className="touch-target bg-gradient-primary hover:bg-primary-dark">
                    Touch-Friendly Button
                  </Button>
                  <Button variant="outline" className="touch-target">
                    Outline Button
                  </Button>
                  <Button variant="secondary" className="touch-target">
                    Secondary Button
                  </Button>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge variant="default" className="touch-target">
                    Touch Badge
                  </Badge>
                  <Badge variant="outline" className="touch-target">
                    Outline Badge
                  </Badge>
                  <Badge variant="secondary" className="touch-target">
                    Secondary Badge
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Visibility Utilities */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Responsive Visibility</h2>
            
            <Card className="shadow-md border-0">
              <CardContent className="section-padding space-y-4">
                <div className="mobile-only bg-accent/10 p-4 rounded-lg border border-accent/20">
                  <h4 className="font-medium text-accent">Mobile Only Content</h4>
                  <p className="text-sm text-muted-foreground">
                    This content only appears on mobile devices (under 768px)
                  </p>
                </div>
                
                <div className="desktop-only bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h4 className="font-medium text-primary">Desktop Only Content</h4>
                  <p className="text-sm text-muted-foreground">
                    This content only appears on tablet and desktop (≥ 768px)
                  </p>
                </div>
                
                <div className="bg-secondary/10 p-4 rounded-lg border border-secondary/20">
                  <h4 className="font-medium text-secondary">Always Visible</h4>
                  <p className="text-sm text-muted-foreground">
                    This content appears on all screen sizes
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Container Examples */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Container System</h2>
            
            <div className="bg-muted/30 rounded-lg border-2 border-dashed border-muted-foreground/20">
              <div className="container-responsive bg-card rounded-lg shadow-sm">
                <div className="section-padding">
                  <h4 className="font-medium mb-2">Responsive Container</h4>
                  <p className="text-sm text-muted-foreground">
                    This container has responsive padding that adjusts based on screen size:
                  </p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>Mobile: 1rem padding</li>
                    <li>Tablet: 1.5rem padding</li>
                    <li>Desktop: 2rem padding</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Safe Overflow Examples */}
          <section>
            <h2 className="text-responsive-lg font-semibold mb-4">Overflow Safety</h2>
            
            <Card className="shadow-md border-0">
              <CardContent className="section-padding">
                <div className="overflow-safe bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Safe Overflow Content</h4>
                  <p className="text-sm text-muted-foreground">
                    This content uses overflow-safe class to prevent horizontal scrolling issues. 
                    Long content like this very long property address: 
                    "1234 Extremely Long Property Address Name That Might Cause Overflow Issues Street, 
                    Very Long City Name, State 12345" 
                    will be handled safely.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default ResponsiveShowcase;