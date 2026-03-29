import mongoose from 'mongoose';

const platformSettingsSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: 'LearnX' },
    categories: [{ type: String }],
    maxUploadSizeMB: { type: Number, default: 500 },
    maintenanceMode: { type: Boolean, default: false },
    contactEmail: { type: String, default: '' },
    aboutText: { type: String, default: '' }
  },
  {
    timestamps: true
  }
);

// Ensure only one settings document exists (singleton pattern)
platformSettingsSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      categories: ['Programming', 'Design', 'Business', 'Marketing', 'Science', 'Mathematics', 'Language', 'Other']
    });
  }
  return settings;
};

const PlatformSettings = mongoose.model('PlatformSettings', platformSettingsSchema);

export default PlatformSettings;
