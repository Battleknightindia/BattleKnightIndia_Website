'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Users, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NameEntryProps {
  names: string[];
  onAddName: (name: string) => void;
  onRemoveName: (index: number) => void;
  onClearAll: () => void;
  onAddBulkNames: (names: string[]) => void;
  maxNames?: number;
  className?: string;
}

export const NameEntry = ({
  names,
  onAddName,
  onRemoveName,
  onClearAll,
  onAddBulkNames,
  maxNames = 100,
  className
}: NameEntryProps) => {
  const [inputValue, setInputValue] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkInput, setShowBulkInput] = useState(false);

  const handleAddName = () => {
    const trimmedName = inputValue.trim();
    if (trimmedName && !names.includes(trimmedName) && names.length < maxNames) {
      onAddName(trimmedName);
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddName();
    }
  };

  const handleBulkAdd = () => {
    if (!bulkInput.trim()) return;
    
    // Parse numbered list format (1. Name1, 2. Name2, etc.)
    const lines = bulkInput.split('\n');
    const parsedNames: string[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Remove numbering (1., 2., etc.) and extract name
        const nameMatch = trimmedLine.match(/^\d+\.\s*(.+)$/) || [null, trimmedLine];
        const name = nameMatch[1]?.trim();
        if (name && !names.includes(name) && !parsedNames.includes(name)) {
          parsedNames.push(name);
        }
      }
    });
    
    if (parsedNames.length > 0) {
      onAddBulkNames(parsedNames);
      setBulkInput('');
      setShowBulkInput(false);
    }
  };

  return (
    <Card className={cn('lg:w-70 lg:max-w-sm', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Users className="w-5 h-5" />
          Participants
        </CardTitle>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{names.length} / {maxNames}</span>
          {names.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-destructive hover:text-destructive"
            >
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 ">
        {/* Toggle Buttons */}
        <div className="flex gap-2 mr-10">
          <Button
            variant={!showBulkInput ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBulkInput(false)}
            className="w-30"
          >
            <Plus className="w-4 h-4" />
            Single Entry
          </Button>
          <Button
            variant={showBulkInput ? "default" : "outline"}
            size="sm"
            onClick={() => setShowBulkInput(true)}
            className="w-30"
          >
            <FileText className="w-4 h-4" />
            Bulk Entry
          </Button>
        </div>

        {/* Input Section */}
        {!showBulkInput ? (
          <div className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter participant name..."
              className="flex-1"
              disabled={names.length >= maxNames}
            />
            <Button
              onClick={handleAddName}
              disabled={!inputValue.trim() || names.includes(inputValue.trim()) || names.length >= maxNames}
              size="sm"
              className="px-3"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="Enter names in this format:&#10;1. Name1&#10;2. Name2&#10;3. Name3&#10;&#10;Or just paste a list of names (one per line)"
              className="min-h-24"
              disabled={names.length >= maxNames}
            />
            <Button
              onClick={handleBulkAdd}
              disabled={!bulkInput.trim() || names.length >= maxNames}
              size="sm"
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Names
            </Button>
          </div>
        )}

        {/* Names List */}
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {names.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No participants yet</p>
              <p className="text-xs">Start adding names to begin</p>
            </div>
          ) : (
            names.map((name, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-secondary rounded-md group hover:bg-secondary/80 transition-colors"
              >
                <span className="text-sm font-medium truncate">{name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveName(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-destructive hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-secondary rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(names.length / maxNames) * 100}%` }}
          />
        </div>
      </CardContent>
    </Card>
  );
};