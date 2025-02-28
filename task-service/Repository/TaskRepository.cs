using Mapster;
using Microsoft.EntityFrameworkCore;
using OrgaFlow.Domain.Entities.EntitiesTask;
using OrgaFlow.Persistence.Configuration;
using task_service.Domain;

namespace task_service.Repository;

public class TaskRepository
{
    private readonly TaskDbContext _context;
    
    public TaskRepository(TaskDbContext context)
    {
        _context = context;
    }

    public async Task<ETask?> GetTaskById(int id, CancellationToken cancellationToken)
    {
        var dbModel = await _context.TaskTable.FindAsync(new object[] { id }, cancellationToken);
        return dbModel?.Adapt<ETask>();
    }

    public async Task<IEnumerable<ETask>> GetAllTasks(CancellationToken cancellationToken)
    {
        var list = await _context.TaskTable.ToListAsync(cancellationToken);
        return list.Adapt<IEnumerable<ETask>>();
    }

    public async Task<ETask> AddTask(ETask task, CancellationToken cancellationToken)
    {
        var dbModel = task.Adapt<TaskDbModel>();
        await _context.TaskTable.AddAsync(dbModel, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return dbModel.Adapt<ETask>();
    }

    public async Task<ETask> UpdateTask(ETask task, CancellationToken cancellationToken)
    {
        var dbModel = task.Adapt<TaskDbModel>();
        _context.TaskTable.Update(dbModel);
        await _context.SaveChangesAsync(cancellationToken);
        return dbModel.Adapt<ETask>();
    }

    public async Task<bool> DeleteTask(int id, CancellationToken cancellationToken)
    {
        var dbModel = await _context.TaskTable.FindAsync(new object[] { id }, cancellationToken);
        if (dbModel == null)
            return false;
        _context.TaskTable.Remove(dbModel);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }
}