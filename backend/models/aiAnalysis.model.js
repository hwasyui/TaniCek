import mongoose from 'mongoose';

const analysisEntrySchema = new mongoose.Schema({
  machine_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  level: {
    type: String,
    enum: ['low', 'medium', 'high'],
    required: true
  },
  notes: {
    type: String,
    required: true
  },
});

const aiAnalysisSchema = new mongoose.Schema({
  aiAnalysis: [analysisEntrySchema]
}, { timestamps: true,
    collection: 'ai_analysis'
 });

export default mongoose.model('AIAnalysis', aiAnalysisSchema);
