import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Card({
  variant = 'default',
  padding = 'md',
  className = '',
  children,
  ...props
}: CardProps) {
  const variantClasses = {
    default: 'bg-white text-card-foreground shadow-md border border-gray-200',
    outline: 'border-2 border-border bg-white',
    ghost: 'bg-transparent',
    elevated: 'bg-white shadow-lg hover:shadow-xl transition-shadow border border-gray-200',
    glass: 'glass backdrop-blur-md border border-border/50 bg-white/90',
  };

  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`rounded-lg transition-all duration-200 ${variantClasses[variant]} ${paddingClasses[padding]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

// Compound Components for better Card structure
export function CardHeader({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex flex-col space-y-1.5 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({
  className = '',
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`flex items-center pt-0 ${className}`} {...props}>
      {children}
    </div>
  );
}
