import mongoose, { Schema } from 'mongoose';
import { type } from 'os';

const frequentlyAskedQuestionsSchema = new Schema({
	title: {
        type: String,
        required: true,
    },
	description: {
        type: String,
        default: '',
    },
    user:{
        type: Schema.Types.ObjectId,
        ref:'users',
        required:true
    },
    isAnswered:{
        type:Boolean,
        default:false
    }

},
{
    timestamps: true
});

export const frequentlyAskedQuestions = mongoose.model('frequentlyAskedQuestions', frequentlyAskedQuestionsSchema);