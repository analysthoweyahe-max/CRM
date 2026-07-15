import { useState } from 'react';
import type { MentionRef } from '@/shared/components/chat';
import { activeMentionsFromText, type MentionablePerson } from '@/shared/utils/mentionComposer.utils';

export function useMentionComposer() {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionRefs, setMentionRefs] = useState<MentionablePerson[]>([]);

  function insertMention(person: MentionablePerson) {
    setShowMentions(false);
    return (prev: string) => {
      const next = (prev.endsWith(' ') || !prev ? prev : `${prev} `) + `@${person.name} `;
      setMentionRefs(refs =>
        refs.some(r => r.id === person.id && r.type === person.type) ? refs : [...refs, person],
      );
      return next;
    };
  }

  function activeMentions(body: string): MentionRef[] {
    return activeMentionsFromText(body, mentionRefs);
  }

  function resetMentions() {
    setMentionRefs([]);
    setShowMentions(false);
  }

  function seedMentions(refs: MentionablePerson[]) {
    setMentionRefs(refs);
  }

  return {
    showMentions,
    setShowMentions,
    mentionRefs,
    insertMention,
    activeMentions,
    resetMentions,
    seedMentions,
  };
}
