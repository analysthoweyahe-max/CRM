import { useState, useEffect } from 'react';
import type { SeoTaskDetail } from '../types/seoTaskDetail.types';
import type { SeoTaskStatus } from '../types/seoTask.types';

export function useSeoTaskDetailInfo(task: SeoTaskDetail | undefined) {
  const [status,          setStatus]          = useState<SeoTaskStatus>(task?.status ?? 'pending');
  const [metaTitle,       setMetaTitle]       = useState(task?.metaTitle ?? '');
  const [metaDescription, setMetaDescription] = useState(task?.metaDescription ?? '');
  const [notes,           setNotes]           = useState(task?.notes ?? '');
  const [siteLinks,       setSiteLinks]       = useState<string[]>(task?.siteLinks ?? []);
  const [referenceLinks,  setReferenceLinks]  = useState<string[]>(task?.referenceLinks ?? []);
  const [newSiteLink,     setNewSiteLink]     = useState('');
  const [newRefLink,      setNewRefLink]      = useState('');

  useEffect(() => {
    if (!task) return;
    setStatus(task.status);
    setMetaTitle(task.metaTitle ?? '');
    setMetaDescription(task.metaDescription ?? '');
    setNotes(task.notes ?? '');
    setSiteLinks(task.siteLinks ?? []);
    setReferenceLinks(task.referenceLinks ?? []);
  }, [task?.id]);

  function addSiteLink() {
    const v = newSiteLink.trim();
    if (!v) return;
    setSiteLinks(prev => [...prev, v]);
    setNewSiteLink('');
  }

  function removeSiteLink(i: number) {
    setSiteLinks(prev => prev.filter((_, idx) => idx !== i));
  }

  function addRefLink() {
    const v = newRefLink.trim();
    if (!v) return;
    setReferenceLinks(prev => [...prev, v]);
    setNewRefLink('');
  }

  function removeRefLink(i: number) {
    setReferenceLinks(prev => prev.filter((_, idx) => idx !== i));
  }

  return {
    status, setStatus,
    metaTitle, setMetaTitle,
    metaDescription, setMetaDescription,
    notes, setNotes,
    siteLinks, newSiteLink, setNewSiteLink, addSiteLink, removeSiteLink,
    referenceLinks, newRefLink, setNewRefLink, addRefLink, removeRefLink,
  };
}
