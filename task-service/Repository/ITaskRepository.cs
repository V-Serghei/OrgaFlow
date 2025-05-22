using task_service.Composite;
using task_service.Domain;

namespace task_service.Repository;

public interface ITaskRepository
{
    Task<IEnumerable<ETask>> GetAllAsync();
    Task<ETask> GetByIdAsync(int id);
    Task<ETask> AddAsync(ETask task);
    Task<ETask> UpdateAsync(ETask task);
    Task DeleteAsync(int id);
    
    Task<IEnumerable<ETask>> GetSortedTasksAsync(string sortBy, bool? notificationsEnabled = null);
    Task<IEnumerable<ETask>> GetTasksDueWithinHoursAsync(int hours);
    Task<IEnumerable<ETask>> GetOverdueTasksAsync();
    
    Task<ETask?> GetTaskDataById(int id, CancellationToken cancellationToken);
    Task<TaskDto?> GetTaskTreeDtoById(int id, CancellationToken cancellationToken);
    Task<ITaskComponent?> GetTaskTreeById(int id, CancellationToken cancellationToken);
    Task<IEnumerable<ITaskComponent>> GetAllTaskTrees(CancellationToken cancellationToken);
    Task<List<ETask>> GetAllTasks(CancellationToken cancellationToken);
    Task<IEnumerable<TaskDto>> GetAllTaskTreesAsDto(CancellationToken cancellationToken);
    Task<ETask> AddTask(ETask task, CancellationToken cancellationToken);
    Task<ETask?> UpdateTask(ETask task, CancellationToken cancellationToken);
    Task<bool> DeleteTask(int id, CancellationToken cancellationToken);
    Task<IEnumerable<ITaskComponent>> GetAllTasksComponent(CancellationToken cancellationToken);
    
    Task<bool> SoftDeleteAsync(int id);
    Task RestoreAsync(int id);
    Task<IEnumerable<ETask>> GetTaskSubtreeAsync(int id);
}