import { Text } from '@/components/common/text';
import { Label } from '@/components/ui/label';
import { ModeToggle } from '@/components/ui/theme-toggle';

export function Appearance() {
  return (
    <div className="pl-3">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label className="mb-1">Theme</Label>
          <ModeToggle />
        </div>
      </div>
    </div>
  );
}
