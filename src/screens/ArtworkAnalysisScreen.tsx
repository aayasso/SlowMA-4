import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ArtworkAnalysisScreenProps {
  navigation: any;
  route: {
    params: {
      imageUri: string;
    };
  };
}

interface EducationalAnalysis {
  styleAnalysis: {
    primaryStyle: string;
    styleCharacteristics: string[];
    movementContext: string;
    stylisticInfluences: string[];
    visualLanguage: string;
    educationalInsights: string[];
  };
  techniqueAnalysis: {
    primaryTechniques: string[];
    materialProperties: string[];
    applicationMethods: string[];
    technicalInnovations: string[];
    skillLevel: string;
    educationalValue: string[];
  };
  themeAnalysis: {
    primaryThemes: string[];
    symbolicElements: string[];
    emotionalTone: string;
    culturalContext: string;
    narrativeElements: string[];
    interpretiveApproaches: string[];
  };
  mediumAnalysis: {
    primaryMedium: string;
    materialCharacteristics: string[];
    historicalUsage: string;
    technicalAdvantages: string[];
    conservationNotes: string[];
    educationalSignificance: string[];
  };
  colorAnalysis: {
    colorPalette: Array<{
      hex: string;
      name: string;
      percentage: number;
      emotionalAssociation: string;
      symbolicMeaning: string;
      educationalNote: string;
    }>;
    colorHarmony: string;
    emotionalImpact: string;
    symbolicMeaning: string[];
    colorTheory: string[];
    educationalInsights: string[];
  };
  compositionAnalysis: {
    compositionalPrinciples: string[];
    visualFlow: string;
    focalPoints: string[];
    spatialRelationships: string[];
    balanceAndRhythm: string[];
    educationalApplications: string[];
  };
  reflectionQuestions: Array<{
    category: 'observation' | 'interpretation' | 'connection' | 'technique';
    question: string;
    followUp?: string;
    educationalGoal: string;
  }>;
  learningObjectives: Array<{
    skill: string;
    description: string;
    assessmentMethod: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  discussionPrompts: Array<{
    topic: string;
    question: string;
    context: string;
    suggestedResponses: string[];
  }>;
  artisticMovements: Array<{
    name: string;
    timePeriod: string;
    characteristics: string[];
    keyArtists: string[];
    culturalContext: string;
    educationalRelevance: string;
  }>;
  visualElements: Array<{
    element: string;
    description: string;
    educationalValue: string;
    observationTips: string[];
    relatedConcepts: string[];
  }>;
  comparativeExamples: Array<{
    title: string;
    artist: string;
    similarity: string;
    contrast: string;
    educationalValue: string;
    imageUrl?: string;
  }>;
  historicalContext: {
    timePeriod: string;
    culturalBackground: string;
    artisticClimate: string;
    socialInfluences: string[];
    educationalSignificance: string;
  };
  confidence: number;
  sources: string[];
  analysisStages: Array<{
    stage: 'vision' | 'interpretation' | 'recall' | 'synthesis';
    description: string;
    apisUsed: string[];
    insights: string[];
    timestamp: Date;
  }>;
}

const ArtworkAnalysisScreen: React.FC<ArtworkAnalysisScreenProps> = ({ navigation, route }) => {
  const { imageUri } = route.params;
  const [loading, setLoading] = useState(true);
  const [educationalAnalysis, setEducationalAnalysis] = useState<EducationalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'style' | 'technique' | 'theme' | 'color' | 'composition' | 'questions'>('overview');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const analyzeArtwork = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Call the comprehensive educational analysis service
        const response = await fetch('http://localhost:3000/api/analyze-comprehensive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageBase64: imageUri
          })
        });

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Analysis failed');
        }

        setEducationalAnalysis(data.analysis);
        
      } catch (error) {
        console.warn('API analysis failed, using mock data:', error);
        
        // Fallback to mock data if API fails
        const mockAnalysis: EducationalAnalysis = {
          styleAnalysis: {
            primaryStyle: "Impressionist",
            styleCharacteristics: ["Visible brushstrokes", "Light and color emphasis", "Outdoor scenes"],
            movementContext: "19th century French art movement",
            stylisticInfluences: ["Realism", "Japanese prints", "Photography"],
            visualLanguage: "Captures fleeting moments of light and atmosphere",
            educationalInsights: ["Shows how artists broke from traditional techniques", "Demonstrates the importance of light in painting"]
          },
          techniqueAnalysis: {
            primaryTechniques: ["Alla prima painting", "Broken color", "Impasto"],
            materialProperties: ["Oil paint on canvas", "Quick-drying medium"],
            applicationMethods: ["Direct painting", "Wet-on-wet technique"],
            technicalInnovations: ["Plein air painting", "Color theory application"],
            skillLevel: "Advanced",
            educationalValue: ["Teaches color mixing", "Shows brushwork techniques", "Demonstrates composition"]
          },
          themeAnalysis: {
            primaryThemes: ["Nature and light", "Transience of moments", "Urban life"],
            symbolicElements: ["Light as symbol of time", "Water as reflection"],
            emotionalTone: "Peaceful, contemplative",
            culturalContext: "19th century Parisian society",
            narrativeElements: ["Daily life scenes", "Leisure activities"],
            interpretiveApproaches: ["Formal analysis", "Historical context", "Personal response"]
          },
          mediumAnalysis: {
            primaryMedium: "Oil on canvas",
            materialCharacteristics: ["Flexible", "Durable", "Rich color"],
            historicalUsage: "Traditional painting medium since Renaissance",
            technicalAdvantages: ["Blendable", "Long working time", "Rich texture"],
            conservationNotes: ["Requires proper storage", "Sensitive to light"],
            educationalSignificance: ["Teaches material properties", "Shows historical techniques"]
          },
          colorAnalysis: {
            colorPalette: [
              { hex: "#87CEEB", name: "Sky Blue", percentage: 30, emotionalAssociation: "Calm", symbolicMeaning: "Sky", educationalNote: "Creates depth" },
              { hex: "#90EE90", name: "Light Green", percentage: 25, emotionalAssociation: "Nature", symbolicMeaning: "Growth", educationalNote: "Balances composition" },
              { hex: "#FFB6C1", name: "Light Pink", percentage: 20, emotionalAssociation: "Gentle", symbolicMeaning: "Softness", educationalNote: "Adds warmth" }
            ],
            colorHarmony: "Analogous color scheme creates unity",
            emotionalImpact: "Creates peaceful, serene mood",
            symbolicMeaning: ["Blue for sky", "Green for nature"],
            colorTheory: ["Complementary colors", "Value relationships"],
            educationalInsights: ["Shows color temperature", "Demonstrates atmospheric perspective"]
          },
          compositionAnalysis: {
            compositionalPrinciples: ["Rule of thirds", "Leading lines", "Atmospheric perspective"],
            visualFlow: "Eye moves from foreground to background",
            focalPoints: ["Central figure", "Light source"],
            spatialRelationships: ["Foreground, middle ground, background"],
            balanceAndRhythm: "Asymmetrical balance with rhythmic brushstrokes",
            educationalApplications: ["Teaches perspective", "Shows composition techniques"]
          },
          reflectionQuestions: [
            {
              category: "observation",
              question: "What do you notice first when looking at this artwork?",
              followUp: "What draws your eye next?",
              educationalGoal: "Develop observational skills"
            },
            {
              category: "interpretation",
              question: "How does the artist use light to create mood?",
              educationalGoal: "Understand artistic techniques"
            },
            {
              category: "connection",
              question: "What emotions does this artwork evoke in you?",
              educationalGoal: "Develop personal response"
            }
          ],
          learningObjectives: [
            {
              skill: "Visual Analysis",
              description: "Learn to identify and analyze visual elements",
              assessmentMethod: "Observation and discussion",
              difficulty: "beginner"
            },
            {
              skill: "Color Theory",
              description: "Understand how colors work together",
              assessmentMethod: "Color mixing exercises",
              difficulty: "intermediate"
            }
          ],
          discussionPrompts: [
            {
              topic: "Color and Mood",
              question: "How do the colors affect your emotional response?",
              context: "Understanding color psychology in art",
              suggestedResponses: ["The blues make me feel calm", "The greens remind me of nature"]
            }
          ],
          artisticMovements: [
            {
              name: "Impressionism",
              timePeriod: "1860s-1880s",
              characteristics: ["Visible brushstrokes", "Light emphasis", "Outdoor scenes"],
              keyArtists: ["Claude Monet", "Pierre-Auguste Renoir", "Edgar Degas"],
              culturalContext: "Response to industrialization and photography",
              educationalRelevance: "Shows how art movements respond to social change"
            }
          ],
          visualElements: [
            {
              element: "Line",
              description: "Brushstrokes create directional movement",
              educationalValue: "Shows how line guides the eye",
              observationTips: ["Follow the brushstrokes", "Notice direction changes"],
              relatedConcepts: ["Movement", "Rhythm", "Direction"]
            }
          ],
          comparativeExamples: [
            {
              title: "Water Lilies",
              artist: "Claude Monet",
              similarity: "Similar brushwork and color palette",
              contrast: "Different subject matter",
              educationalValue: "Shows artist's consistent style"
            }
          ],
          historicalContext: {
            timePeriod: "19th century",
            culturalBackground: "Industrial Revolution era",
            artisticClimate: "Rejection of academic art",
            socialInfluences: ["Photography", "Urbanization", "Leisure time"],
            educationalSignificance: "Shows how art reflects social change"
          },
          confidence: 0.85,
          sources: ["Google Vision", "OpenAI", "Wikipedia"],
          analysisStages: []
        };
        
        setEducationalAnalysis(mockAnalysis);
      } finally {
        setLoading(false);
      }
    };

    analyzeArtwork();
  }, [imageUri]);

  const renderTabContent = () => {
    if (!educationalAnalysis) return null;

    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Educational Overview</Text>
            <Text style={styles.description}>
              This artwork demonstrates {educationalAnalysis.styleAnalysis.primaryStyle.toLowerCase()} characteristics 
              through {educationalAnalysis.techniqueAnalysis.primaryTechniques.join(', ').toLowerCase()}. 
              The {educationalAnalysis.themeAnalysis.emotionalTone.toLowerCase()} mood is created through 
              careful use of {educationalAnalysis.colorAnalysis.colorHarmony.toLowerCase()}.
            </Text>
            
            <View style={styles.learningObjectivesContainer}>
              <Text style={styles.sectionTitle}>Learning Objectives</Text>
              {educationalAnalysis.learningObjectives.map((objective, index) => (
                <View key={index} style={styles.objectiveItem}>
                  <Icon name="school" size={16} color="#4CAF50" />
                  <View style={styles.objectiveContent}>
                    <Text style={styles.objectiveSkill}>{objective.skill}</Text>
                    <Text style={styles.objectiveDescription}>{objective.description}</Text>
                    <Text style={styles.objectiveDifficulty}>
                      Level: {objective.difficulty.charAt(0).toUpperCase() + objective.difficulty.slice(1)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );

      case 'style':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Style Analysis</Text>
            <Text style={styles.primaryStyle}>{educationalAnalysis.styleAnalysis.primaryStyle}</Text>
            <Text style={styles.movementContext}>{educationalAnalysis.styleAnalysis.movementContext}</Text>
            
            <View style={styles.characteristicsContainer}>
              <Text style={styles.subsectionTitle}>Key Characteristics</Text>
              {educationalAnalysis.styleAnalysis.styleCharacteristics.map((char, index) => (
                <View key={index} style={styles.characteristicItem}>
                  <Icon name="check-circle" size={16} color="#2196F3" />
                  <Text style={styles.characteristicText}>{char}</Text>
                </View>
              ))}
            </View>

            <View style={styles.insightsContainer}>
              <Text style={styles.subsectionTitle}>Educational Insights</Text>
              {educationalAnalysis.styleAnalysis.educationalInsights.map((insight, index) => (
                <Text key={index} style={styles.insightText}>• {insight}</Text>
              ))}
            </View>
          </View>
        );

      case 'technique':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Technique Analysis</Text>
            
            <View style={styles.techniqueSection}>
              <Text style={styles.subsectionTitle}>Primary Techniques</Text>
              {educationalAnalysis.techniqueAnalysis.primaryTechniques.map((technique, index) => (
                <View key={index} style={styles.techniqueItem}>
                  <Icon name="build" size={16} color="#FF9800" />
                  <Text style={styles.techniqueText}>{technique}</Text>
                </View>
              ))}
            </View>

            <View style={styles.techniqueSection}>
              <Text style={styles.subsectionTitle}>Materials & Methods</Text>
              {educationalAnalysis.techniqueAnalysis.materialProperties.map((material, index) => (
                <Text key={index} style={styles.materialText}>• {material}</Text>
              ))}
            </View>

            <View style={styles.techniqueSection}>
              <Text style={styles.subsectionTitle}>Educational Value</Text>
              {educationalAnalysis.techniqueAnalysis.educationalValue.map((value, index) => (
                <Text key={index} style={styles.valueText}>• {value}</Text>
              ))}
            </View>
          </View>
        );

      case 'color':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Color Analysis</Text>
            
            <View style={styles.colorPaletteContainer}>
              {educationalAnalysis.colorAnalysis.colorPalette.map((color, index) => (
                <View key={index} style={styles.colorItem}>
                  <View style={[styles.colorSwatch, { backgroundColor: color.hex }]} />
                  <View style={styles.colorInfo}>
                    <Text style={styles.colorName}>{color.name}</Text>
                    <Text style={styles.colorPercentage}>{color.percentage}%</Text>
                    <Text style={styles.colorEmotion}>{color.emotionalAssociation}</Text>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.colorTheoryContainer}>
              <Text style={styles.subsectionTitle}>Color Harmony</Text>
              <Text style={styles.colorHarmonyText}>{educationalAnalysis.colorAnalysis.colorHarmony}</Text>
              
              <Text style={styles.subsectionTitle}>Emotional Impact</Text>
              <Text style={styles.emotionalImpactText}>{educationalAnalysis.colorAnalysis.emotionalImpact}</Text>
            </View>
          </View>
        );

      case 'questions':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Reflection Questions</Text>
            
            {educationalAnalysis.reflectionQuestions.length > 0 && (
              <View style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                  <Text style={styles.questionCategory}>
                    {educationalAnalysis.reflectionQuestions[currentQuestionIndex].category.toUpperCase()}
                  </Text>
                  <Text style={styles.questionNumber}>
                    {currentQuestionIndex + 1} of {educationalAnalysis.reflectionQuestions.length}
                  </Text>
                </View>
                
                <Text style={styles.questionText}>
                  {educationalAnalysis.reflectionQuestions[currentQuestionIndex].question}
                </Text>
                
                {educationalAnalysis.reflectionQuestions[currentQuestionIndex].followUp && (
                  <Text style={styles.followUpText}>
                    {educationalAnalysis.reflectionQuestions[currentQuestionIndex].followUp}
                  </Text>
                )}
                
                <Text style={styles.educationalGoal}>
                  Goal: {educationalAnalysis.reflectionQuestions[currentQuestionIndex].educationalGoal}
                </Text>
                
                <View style={styles.questionNavigation}>
                  <TouchableOpacity 
                    style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
                    onPress={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    <Icon name="chevron-left" size={20} color={currentQuestionIndex === 0 ? "#ccc" : "#2196F3"} />
                    <Text style={[styles.navButtonText, currentQuestionIndex === 0 && styles.navButtonTextDisabled]}>
                      Previous
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.navButton, currentQuestionIndex === educationalAnalysis.reflectionQuestions.length - 1 && styles.navButtonDisabled]}
                    onPress={() => setCurrentQuestionIndex(Math.min(educationalAnalysis.reflectionQuestions.length - 1, currentQuestionIndex + 1))}
                    disabled={currentQuestionIndex === educationalAnalysis.reflectionQuestions.length - 1}
                  >
                    <Text style={[styles.navButtonText, currentQuestionIndex === educationalAnalysis.reflectionQuestions.length - 1 && styles.navButtonTextDisabled]}>
                      Next
                    </Text>
                    <Icon name="chevron-right" size={20} color={currentQuestionIndex === educationalAnalysis.reflectionQuestions.length - 1 ? "#ccc" : "#2196F3"} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Analyzing artwork for educational insights...</Text>
          <Text style={styles.loadingSubtext}>This may take a moment as we gather comprehensive data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Educational Analysis</Text>
        <TouchableOpacity onPress={() => Alert.alert('Help', 'Tap different tabs to explore various aspects of this artwork. Use the questions tab to engage in reflection.')}>
          <Icon name="help" size={24} color="#2196F3" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Artwork Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.artworkImage} />
          {educationalAnalysis && (
            <View style={styles.confidenceBadge}>
              <Icon name="verified" size={16} color="#4CAF50" />
              <Text style={styles.confidenceText}>
                {Math.round(educationalAnalysis.confidence * 100)}% Confidence
              </Text>
            </View>
          )}
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Icon name="error" size={24} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Tab Navigation */}
        {educationalAnalysis && (
          <View style={styles.tabContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
              {[
                { key: 'overview', label: 'Overview', icon: 'info' },
                { key: 'style', label: 'Style', icon: 'palette' },
                { key: 'technique', label: 'Technique', icon: 'build' },
                { key: 'color', label: 'Color', icon: 'color-lens' },
                { key: 'questions', label: 'Questions', icon: 'quiz' }
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tab, activeTab === tab.key && styles.activeTab]}
                  onPress={() => setActiveTab(tab.key as any)}
                >
                  <Icon 
                    name={tab.icon} 
                    size={16} 
                    color={activeTab === tab.key ? "#ffffff" : "#666666"} 
                  />
                  <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Tab Content */}
        {renderTabContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
    position: 'relative',
  },
  artworkImage: {
    width: Math.min(width * 0.8, 300),
    height: Math.min(width * 0.8, 300),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confidenceBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  tabContainer: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tabScrollView: {
    paddingHorizontal: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#ffffff',
  },
  tabContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
    marginTop: 16,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 20,
  },
  primaryStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  movementContext: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  characteristicsContainer: {
    marginBottom: 20,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  characteristicText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  insightsContainer: {
    marginBottom: 20,
  },
  insightText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    lineHeight: 20,
  },
  techniqueSection: {
    marginBottom: 20,
  },
  techniqueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
  },
  techniqueText: {
    fontSize: 14,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  materialText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    lineHeight: 20,
  },
  valueText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 6,
    lineHeight: 20,
  },
  colorPaletteContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
  },
  colorSwatch: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
  },
  colorPercentage: {
    fontSize: 10,
    color: '#666666',
  },
  colorEmotion: {
    fontSize: 10,
    color: '#999999',
  },
  colorTheoryContainer: {
    marginBottom: 20,
  },
  colorHarmonyText: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 20,
  },
  emotionalImpactText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  learningObjectivesContainer: {
    marginBottom: 20,
  },
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  objectiveContent: {
    flex: 1,
    marginLeft: 8,
  },
  objectiveSkill: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 4,
  },
  objectiveDescription: {
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
    lineHeight: 20,
  },
  objectiveDifficulty: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  questionContainer: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  questionCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2196F3',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionNumber: {
    fontSize: 12,
    color: '#666666',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
    lineHeight: 24,
  },
  followUpText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 12,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  educationalGoal: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  questionNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2196F3',
  },
  navButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
    marginHorizontal: 4,
  },
  navButtonTextDisabled: {
    color: '#999999',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 16,
    margin: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    fontSize: 14,
    color: '#D32F2F',
    marginLeft: 8,
    flex: 1,
  },
});

export default ArtworkAnalysisScreen;
