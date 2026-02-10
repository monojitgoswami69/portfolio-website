// Skill icons data using static assets
export const skillsData = [
    { image: '/assets/python.webp', name: 'Python' },
    { image: '/assets/c.webp', name: 'C' },
    { image: '/assets/cpp.webp', name: 'C++' },
    { image: '/assets/js.webp', name: 'JavaScript' },
    { image: '/assets/ts.webp', name: 'TypeScript' },
    { image: '/assets/mysql.webp', name: 'SQL' },
    { image: '/assets/mongodb.webp', name: 'MongoDB' },
];

export const toolsData = [
    'Firebase', "GCP", 'Pinecone', 'ChromaDB',
    'Langchain', 'Transformers'
    , 'Git', 'Linux'
];

// System metrics data
export interface Metric {
    label: string;
    value: string;
    icon: React.ElementType;
    color: string;
    glowColor: string;
}
