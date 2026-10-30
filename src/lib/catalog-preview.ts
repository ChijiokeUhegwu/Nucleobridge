export type CatalogPreviewItem = {
  slug: string;
  title: string;
  accessLabel: string;
  accessTone: 'free' | 'pro';
  description: string;
  meta: string[];
};

export const CATALOG_PREVIEW: CatalogPreviewItem[] = [
  {
    slug: 'viral-genomic-outbreak-surveillance',
    title: 'Viral Genomic Outbreak Surveillance',
    accessLabel: 'SPLIT • Free Steps 1–3',
    accessTone: 'free',
    description:
      'Inspect raw FASTQ reads, align viral sequences using samtools via Biowasm, and detect lineage-defining mutations in Python.',
    meta: ['10 Steps', 'Pyodide & Biowasm', '~20 min/step'],
  },
  {
    slug: 'bacterial-genome-assembly-annotation',
    title: 'Bacterial Genome Assembly & Annotation',
    accessLabel: 'PRO Plan',
    accessTone: 'pro',
    description:
      'Perform quality filtration, evaluate k-mer frequencies, reconstruct de novo contigs, and generate functional antimicrobial resistance profiles.',
    meta: ['8 Steps', 'WebR & Python', 'Advanced'],
  },
];
