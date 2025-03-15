import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { 
  PlusIcon, 
  TrashIcon, 
  DocumentTextIcon, 
  ChatBubbleLeftRightIcon, 
  ArrowPathIcon, 
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { AIAgent } from './AIAgentForm';
import aiService from '../../services/ai/aiService';

interface TrainingData {
  type: 'conversation' | 'document' | 'example';
  id: string;
  name: string;
  description?: string;
  added: Date;
  status: 'pending' | 'processed' | 'failed';
  metadata?: {
    size?: number;
    messageCount?: number;
    documentType?: string;
  };
}

interface FineTuningJob {
  id: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  finishedAt?: Date;
  model: string;
  baseModel: string;
  trainingFiles: string[];
  validationFiles?: string[];
  hyperparameters?: {
    epochs: number;
    batchSize?: number;
    learningRate?: number;
  };
  resultMetrics?: {
    accuracy?: number;
    loss?: number;
  };
}

interface AIAgentTrainingProps {
  agent: AIAgent;
  onUpdateAgent: (updatedAgent: AIAgent) => void;
}

const AIAgentTraining: React.FC<AIAgentTrainingProps> = ({ agent, onUpdateAgent }) => {
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [fineTuningJobs, setFineTuningJobs] = useState<FineTuningJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'finetune'>('data');
  const [showAddDataModal, setShowAddDataModal] = useState(false);
  const [showAddExampleModal, setShowAddExampleModal] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState<string[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [exampleData, setExampleData] = useState({ input: '', output: '' });
  
  // Load training data (simulated)
  useEffect(() => {
    const loadTrainingData = async () => {
      setIsLoading(true);
      
      try {
        // In a real implementation, this would come from the API
        // const data = await aiService.getAgentTrainingData(agent.id);
        
        // Simulated data for now
        const mockTrainingData: TrainingData[] = [
          {
            type: 'conversation',
            id: 'conv-1',
            name: 'Conversación con Cliente #45782',
            description: 'Consulta sobre precios y disponibilidad de productos',
            added: new Date('2023-11-05'),
            status: 'processed',
            metadata: {
              messageCount: 12
            }
          },
          {
            type: 'document',
            id: 'doc-1',
            name: 'Manual de Producto.pdf',
            added: new Date('2023-11-02'),
            status: 'processed',
            metadata: {
              size: 256000,
              documentType: 'pdf'
            }
          },
          {
            type: 'example',
            id: 'ex-1',
            name: 'Ejemplo: Consulta de precios',
            added: new Date('2023-11-10'),
            status: 'processed'
          },
          {
            type: 'document',
            id: 'doc-2',
            name: 'Políticas de Devolución.docx',
            added: new Date('2023-11-15'),
            status: 'pending',
            metadata: {
              size: 128000,
              documentType: 'docx'
            }
          }
        ];
        
        setTrainingData(mockTrainingData);
        
        // Simulated fine-tuning jobs
        const mockJobs: FineTuningJob[] = [
          {
            id: 'ft-1',
            status: 'succeeded',
            createdAt: new Date('2023-11-20'),
            updatedAt: new Date('2023-11-20'),
            finishedAt: new Date('2023-11-20'),
            model: 'ft:gpt-3.5-turbo:custom-org:custom-model:1234',
            baseModel: 'gpt-3.5-turbo',
            trainingFiles: ['conv-1', 'doc-1', 'ex-1'],
            hyperparameters: {
              epochs: 3,
              batchSize: 8
            },
            resultMetrics: {
              accuracy: 0.92,
              loss: 0.0432
            }
          },
          {
            id: 'ft-2',
            status: 'running',
            createdAt: new Date('2023-11-25'),
            updatedAt: new Date('2023-11-25'),
            model: 'pending',
            baseModel: 'gpt-4',
            trainingFiles: ['conv-1', 'doc-1', 'doc-2', 'ex-1'],
            hyperparameters: {
              epochs: 4
            }
          }
        ];
        
        setFineTuningJobs(mockJobs);
      } catch (error) {
        console.error('Error loading training data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadTrainingData();
  }, [agent.id]);
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Desconocido';
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };
  
  // Add new training data
  const handleAddTrainingData = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // await aiService.addTrainingData(agent.id, { conversations: selectedConversations, documents: selectedDocuments });
      
      // Simulated addition for now
      const newData: TrainingData[] = [
        ...selectedConversations.map(id => ({
          type: 'conversation' as const,
          id: `conv-${Date.now()}-${id}`,
          name: `Conversación #${id}`,
          added: new Date(),
          status: 'pending' as const,
          metadata: {
            messageCount: Math.floor(Math.random() * 20) + 5
          }
        })),
        ...selectedDocuments.map(id => ({
          type: 'document' as const,
          id: `doc-${Date.now()}-${id}`,
          name: `Documento #${id}.pdf`,
          added: new Date(),
          status: 'pending' as const,
          metadata: {
            size: Math.floor(Math.random() * 5000000) + 10000,
            documentType: 'pdf'
          }
        }))
      ];
      
      setTrainingData(prev => [...prev, ...newData]);
      setShowAddDataModal(false);
      setSelectedConversations([]);
      setSelectedDocuments([]);
    } catch (error) {
      console.error('Error adding training data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add example data
  const handleAddExample = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // await aiService.addTrainingExample(agent.id, exampleData);
      
      // Simulated addition for now
      const newExample: TrainingData = {
        type: 'example',
        id: `ex-${Date.now()}`,
        name: `Ejemplo: ${exampleData.input.substring(0, 20)}...`,
        description: `${exampleData.input.substring(0, 30)}... → ${exampleData.output.substring(0, 30)}...`,
        added: new Date(),
        status: 'pending'
      };
      
      setTrainingData(prev => [...prev, newExample]);
      setShowAddExampleModal(false);
      setExampleData({ input: '', output: '' });
    } catch (error) {
      console.error('Error adding example:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete training data
  const handleDeleteTrainingData = async (id: string) => {
    if (!window.confirm('¿Estás seguro de eliminar este dato de entrenamiento?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // await aiService.deleteTrainingData(agent.id, id);
      
      // Simulated deletion for now
      setTrainingData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting training data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Start fine-tuning
  const handleStartFineTuning = async () => {
    if (!window.confirm('¿Estás seguro de iniciar un nuevo proceso de fine-tuning? Esto puede tomar tiempo y consumir créditos.')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // await aiService.startFineTuning(agent.id, {
      //   baseModel: 'gpt-3.5-turbo',
      //   trainingFiles: trainingData.map(d => d.id),
      //   hyperparameters: {
      //     epochs: 3
      //   }
      // });
      
      // Simulated job creation
      const newJob: FineTuningJob = {
        id: `ft-${Date.now()}`,
        status: 'queued',
        createdAt: new Date(),
        updatedAt: new Date(),
        model: 'pending',
        baseModel: 'gpt-3.5-turbo',
        trainingFiles: trainingData.map(d => d.id),
        hyperparameters: {
          epochs: 3
        }
      };
      
      setFineTuningJobs(prev => [...prev, newJob]);
    } catch (error) {
      console.error('Error starting fine-tuning:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Select a fine-tuned model
  const handleSelectModel = async (jobId: string) => {
    const job = fineTuningJobs.find(j => j.id === jobId);
    
    if (!job || job.status !== 'succeeded') {
      alert('Solo puedes seleccionar un modelo que haya completado el entrenamiento correctamente.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // In a real implementation, this would call the API
      // await aiService.updateAgent({ ...agent, model: job.model });
      
      // Update locally
      const updatedAgent = { ...agent, model: job.model };
      onUpdateAgent(updatedAgent);
      
      alert('El modelo ha sido seleccionado y establecido como el modelo activo para este agente.');
    } catch (error) {
      console.error('Error selecting model:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Cancel a running fine-tuning job
  const handleCancelFineTuning = async (jobId: string) => {
    if (!window.confirm('¿Estás seguro de cancelar este trabajo de fine-tuning?')) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would call the API
      // await aiService.cancelFineTuning(agent.id, jobId);
      
      // Simulated cancellation
      setFineTuningJobs(prev => 
        prev.map(job => 
          job.id === jobId 
            ? { ...job, status: 'cancelled', updatedAt: new Date() } 
            : job
        )
      );
    } catch (error) {
      console.error('Error cancelling fine-tuning:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'data'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('data')}
          >
            Datos de Entrenamiento
          </button>
          <button
            className={`py-4 px-6 font-medium text-sm focus:outline-none ${
              activeTab === 'finetune'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('finetune')}
          >
            Fine-tuning
          </button>
        </nav>
      </div>
      
      {/* Training Data Tab */}
      {activeTab === 'data' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Datos de Entrenamiento</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddExampleModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Añadir Ejemplo
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddDataModal(true)}
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Añadir Datos
              </Button>
            </div>
          </div>
          
          {isLoading && trainingData.length === 0 ? (
            <div className="flex justify-center py-10">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : trainingData.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                No hay datos de entrenamiento disponibles. Agrega conversaciones, documentos o ejemplos para mejorar el rendimiento del agente.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setShowAddExampleModal(true)}
                >
                  Añadir Ejemplo
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowAddDataModal(true)}
                >
                  Añadir Datos
                </Button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Detalles
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {trainingData.map(item => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type === 'conversation' ? (
                            <ChatBubbleLeftRightIcon className="h-5 w-5 text-blue-500 mr-2" />
                          ) : item.type === 'document' ? (
                            <DocumentTextIcon className="h-5 w-5 text-green-500 mr-2" />
                          ) : (
                            <CheckCircleIcon className="h-5 w-5 text-purple-500 mr-2" />
                          )}
                          <span className="text-sm text-gray-900">
                            {item.type === 'conversation' ? 'Conversación' : 
                             item.type === 'document' ? 'Documento' : 'Ejemplo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500">{item.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {item.added.toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={
                            item.status === 'processed' ? 'green' :
                            item.status === 'pending' ? 'yellow' : 'red'
                          }
                          size="sm"
                        >
                          {item.status === 'processed' ? 'Procesado' :
                           item.status === 'pending' ? 'Pendiente' : 'Error'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {item.type === 'document' && item.metadata?.size && (
                            <span>{formatFileSize(item.metadata.size)}</span>
                          )}
                          {item.type === 'conversation' && item.metadata?.messageCount && (
                            <span>{item.metadata.messageCount} mensajes</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          className="text-red-600 hover:text-red-900"
                          onClick={() => handleDeleteTrainingData(item.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="text-sm text-gray-500 mt-4">
            <p>El entrenamiento con datos específicos mejora significativamente el rendimiento del agente, especialmente para tareas especializadas.</p>
          </div>
        </div>
      )}
      
      {/* Fine-tuning Tab */}
      {activeTab === 'finetune' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Fine-tuning</h3>
            <Button
              variant="primary"
              size="sm"
              onClick={handleStartFineTuning}
              disabled={isLoading || trainingData.length === 0}
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Iniciar Fine-tuning
            </Button>
          </div>
          
          {isLoading && fineTuningJobs.length === 0 ? (
            <div className="flex justify-center py-10">
              <ArrowPathIcon className="h-8 w-8 text-gray-400 animate-spin" />
            </div>
          ) : fineTuningJobs.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <p className="text-sm text-gray-600 mb-4">
                No hay trabajos de fine-tuning. Inicia un nuevo proceso para entrenar el modelo con tus datos personalizados.
              </p>
              <Button
                variant="primary"
                onClick={handleStartFineTuning}
                disabled={trainingData.length === 0}
              >
                Iniciar Fine-tuning
              </Button>
              {trainingData.length === 0 && (
                <p className="text-xs text-gray-500 mt-3">
                  Necesitas agregar datos de entrenamiento antes de iniciar el fine-tuning.
                </p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trabajo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Modelo Base
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Métricas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {fineTuningJobs.map(job => (
                    <tr key={job.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.id}</div>
                        <div className="text-xs text-gray-500">
                          {job.trainingFiles.length} archivos usados
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={
                            job.status === 'succeeded' ? 'green' :
                            job.status === 'failed' ? 'red' :
                            job.status === 'cancelled' ? 'gray' : 'yellow'
                          }
                          size="sm"
                        >
                          {job.status === 'succeeded' ? 'Completado' :
                           job.status === 'failed' ? 'Fallido' :
                           job.status === 'cancelled' ? 'Cancelado' :
                           job.status === 'running' ? 'En Progreso' : 'En Cola'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{job.baseModel}</div>
                        <div className="text-xs text-gray-500">
                          {job.hyperparameters?.epochs || '-'} épocas
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {job.createdAt.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {job.finishedAt ? `Completado: ${job.finishedAt.toLocaleDateString()}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {job.resultMetrics ? (
                          <div className="text-sm text-gray-600">
                            <div>Precisión: {(job.resultMetrics.accuracy * 100).toFixed(1)}%</div>
                            <div>Loss: {job.resultMetrics.loss.toFixed(4)}</div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {job.status === 'succeeded' ? (
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => handleSelectModel(job.id)}
                          >
                            {agent.model === job.model ? 'Modelo Activo' : 'Usar Modelo'}
                          </button>
                        ) : (job.status === 'queued' || job.status === 'running') ? (
                          <button
                            className="text-red-600 hover:text-red-900"
                            onClick={() => handleCancelFineTuning(job.id)}
                          >
                            Cancelar
                          </button>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 mt-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Información Importante sobre Fine-tuning</h4>
            <ul className="text-sm text-yellow-700 space-y-1 list-disc pl-5">
              <li>El fine-tuning consume créditos de OpenAI y puede tomar entre 1-4 horas dependiendo del tamaño de los datos.</li>
              <li>Para obtener mejores resultados, proporciona al menos 10-20 ejemplos de alta calidad.</li>
              <li>Los modelos fine-tuned tienen un costo por token ligeramente mayor que los modelos base.</li>
              <li>OpenAI almacena tus datos de entrenamiento para mejorar el modelo. No incluyas información sensible.</li>
            </ul>
          </div>
        </div>
      )}
      
      {/* Add Data Modal */}
      {showAddDataModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Añadir Datos de Entrenamiento</h3>
            </div>
            
            <div className="px-6 py-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Conversaciones</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {[1, 2, 3, 4, 5].map(id => (
                      <div key={id} className="flex items-center py-2">
                        <input
                          type="checkbox"
                          id={`conv-${id}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedConversations.includes(id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedConversations(prev => [...prev, id.toString()]);
                            } else {
                              setSelectedConversations(prev => prev.filter(i => i !== id.toString()));
                            }
                          }}
                        />
                        <label htmlFor={`conv-${id}`} className="ml-2 block text-sm text-gray-900">
                          Conversación #{id} - Cliente {1000 + id}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Documentos</h4>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-md p-3">
                    {[1, 2, 3].map(id => (
                      <div key={id} className="flex items-center py-2">
                        <input
                          type="checkbox"
                          id={`doc-${id}`}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          checked={selectedDocuments.includes(id.toString())}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocuments(prev => [...prev, id.toString()]);
                            } else {
                              setSelectedDocuments(prev => prev.filter(i => i !== id.toString()));
                            }
                          }}
                        />
                        <label htmlFor={`doc-${id}`} className="ml-2 block text-sm text-gray-900">
                          {['Manual de Usuario.pdf', 'Preguntas Frecuentes.docx', 'Especificaciones de Producto.pdf'][id - 1]}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddDataModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAddTrainingData}
                disabled={selectedConversations.length === 0 && selectedDocuments.length === 0}
              >
                Añadir Seleccionados
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Example Modal */}
      {showAddExampleModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">Añadir Ejemplo de Entrenamiento</h3>
            </div>
            
            <div className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-1">
                    Entrada (prompt o mensaje del usuario)
                  </label>
                  <textarea
                    id="input"
                    rows={3}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={exampleData.input}
                    onChange={(e) => setExampleData(prev => ({ ...prev, input: e.target.value }))}
                    placeholder="Ej.: ¿Cuál es el precio del producto X?"
                  />
                </div>
                
                <div>
                  <label htmlFor="output" className="block text-sm font-medium text-gray-700 mb-1">
                    Salida (respuesta deseada del modelo)
                  </label>
                  <textarea
                    id="output"
                    rows={5}
                    className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={exampleData.output}
                    onChange={(e) => setExampleData(prev => ({ ...prev, output: e.target.value }))}
                    placeholder="Ej.: El producto X tiene un precio de $99.99. Está disponible en 3 colores: rojo, azul y negro. ¿Puedo ayudarte con algo más?"
                  />
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddExampleModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleAddExample}
                disabled={!exampleData.input.trim() || !exampleData.output.trim()}
              >
                Añadir Ejemplo
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAgentTraining;