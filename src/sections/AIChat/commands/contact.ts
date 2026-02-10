import { ChatMessage } from '../types';

export const contactCommand = (): ChatMessage => ({
    role: 'model',
    text: "## ESTABLISHING SIGNAL...\n\n- **Email**: [monojitgoswami.dev@gmail.com](mailto:monojitgoswami.dev@gmail.com)\n- **GitHub**: [github.com/monojitgoswami69](https://github.com/monojitgoswami69)\n- **LinkedIn**: [linkedin.com/in/monojitgoswami69](https://linkedin.com/in/monojitgoswami69)\n- **Twitter**: [twitter.com/monojitgoswami9](https://twitter.com/monojitgoswami9)",
    timestamp: new Date()
});
