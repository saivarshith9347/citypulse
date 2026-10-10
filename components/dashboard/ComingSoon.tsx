import { Card, CardContent } from '@/components/ui/card';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  description: string;
}

export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <Card>
      <CardContent className="p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <Construction className="w-16 h-16 text-cyan-500 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>
          <p className="text-gray-400 max-w-md">{description}</p>
          <p className="text-sm text-gray-500 mt-4">
            Coming in next implementation phase
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
