import React from 'react';
import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { ChevronRight } from 'lucide-react';
import './Dropdown.css';

export default function Dropdown({ trigger, items }) {
  const renderItems = (dropItems) => {
    return dropItems.map((item, idx) => {
      if (item.type === 'separator') {
        return <RadixDropdown.Separator key={`sep-${idx}`} className="dropdown-separator" />;
      }

      if (item.children) {
        return (
          <RadixDropdown.Sub key={item.label || idx}>
            <RadixDropdown.SubTrigger className="dropdown-item flex justify-between items-center">
              <span className="flex items-center gap-2">
                {item.icon && <item.icon size={16} />}
                {item.label}
              </span>
              <ChevronRight size={14} className="text-gray-500" />
            </RadixDropdown.SubTrigger>
            <RadixDropdown.Portal>
              <RadixDropdown.SubContent className="dropdown-content z-[1100]">
                {renderItems(item.children)}
              </RadixDropdown.SubContent>
            </RadixDropdown.Portal>
          </RadixDropdown.Sub>
        );
      }

      return (
        <RadixDropdown.Item
          key={item.label || idx}
          onClick={item.onClick}
          disabled={item.disabled}
          className={`dropdown-item flex items-center gap-2 ${item.variant === 'danger' ? 'danger' : ''}`}
        >
          {item.icon && <item.icon size={16} />}
          <span>{item.label}</span>
          {item.shortcut && <span className="ml-auto text-xs text-gray-500 font-mono">{item.shortcut}</span>}
        </RadixDropdown.Item>
      );
    });
  };

  return (
    <RadixDropdown.Root>
      <RadixDropdown.Trigger asChild>
        {trigger}
      </RadixDropdown.Trigger>
      <RadixDropdown.Portal>
        <RadixDropdown.Content className="dropdown-content z-[1100]" align="end">
          {renderItems(items)}
        </RadixDropdown.Content>
      </RadixDropdown.Portal>
    </RadixDropdown.Root>
  );
}
