import React from 'react';
import * as RadixContextMenu from '@radix-ui/react-context-menu';
import { ChevronRight } from 'lucide-react';
import './ContextMenu.css';

export default function ContextMenu({ trigger, items }) {
  const renderItems = (menuItems) => {
    return menuItems.map((item, idx) => {
      if (item.type === 'separator') {
        return <RadixContextMenu.Separator key={`sep-${idx}`} className="context-menu-separator" />;
      }

      if (item.children) {
        return (
          <RadixContextMenu.Sub key={item.label || idx}>
            <RadixContextMenu.SubTrigger className="context-menu-item flex justify-between items-center">
              <span className="flex items-center gap-2">
                {item.icon && <item.icon size={16} />}
                {item.label}
              </span>
              <ChevronRight size={14} className="text-gray-500" />
            </RadixContextMenu.SubTrigger>
            <RadixContextMenu.Portal>
              <RadixContextMenu.SubContent className="context-menu-content z-[1100]">
                {renderItems(item.children)}
              </RadixContextMenu.SubContent>
            </RadixContextMenu.Portal>
          </RadixContextMenu.Sub>
        );
      }

      return (
        <RadixContextMenu.Item
          key={item.label || idx}
          onClick={item.onClick}
          disabled={item.disabled}
          className={`context-menu-item flex items-center gap-2 ${item.variant === 'danger' ? 'danger' : ''}`}
        >
          {item.icon && <item.icon size={16} />}
          <span>{item.label}</span>
          {item.shortcut && <span className="ml-auto text-xs text-gray-500 font-mono">{item.shortcut}</span>}
        </RadixContextMenu.Item>
      );
    });
  };

  return (
    <RadixContextMenu.Root>
      <RadixContextMenu.Trigger asChild>
        {trigger}
      </RadixContextMenu.Trigger>
      <RadixContextMenu.Portal>
        <RadixContextMenu.Content className="context-menu-content z-[1100]">
          {renderItems(items)}
        </RadixContextMenu.Content>
      </RadixContextMenu.Portal>
    </RadixContextMenu.Root>
  );
}
