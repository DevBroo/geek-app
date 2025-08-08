import { frequentlyAskedQuestions } from "../../models/frequentlyAskedQuestions.model.js";

const frequentlyAskedQuestionsResource = {
    resource: frequentlyAskedQuestions,
                options: {
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'text' },
                        userId: { isVisible: true }, // Link to User if User resource is registered
                        isAnswered: { type: 'boolean' },
                    }
                    },
                    listProperties: ['title', 'isAnswered'],
                    showProperties: ['title', 'description', 'isAnswered'],
                    editProperties: ['title', 'description', 'isAnswered'],
                    filterProperties: ['title', 'isAnswered'],
}

export  {frequentlyAskedQuestionsResource};