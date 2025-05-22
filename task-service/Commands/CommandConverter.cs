using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.DependencyInjection;
using task_service.Domain;
using task_service.Repository;

namespace task_service.Commands
{
    public class CommandConverter : JsonConverter<ICommand>
    {
        private readonly IServiceProvider _serviceProvider;
        
        public CommandConverter(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }
        
        public override ICommand? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions? options)
{
    using var jsonDoc = JsonDocument.ParseValue(ref reader);
    var jsonObject = jsonDoc.RootElement;

    if (!jsonObject.TryGetProperty("type", out var typeProperty))
    {
        throw new JsonException("Поле 'type' отсутствует в JSON для ICommand");
    }

    var type = typeProperty.GetString();
    using (var scope = _serviceProvider.CreateScope())
    {
        var repository = scope.ServiceProvider.GetRequiredService<ITaskRepository>();
        
        switch (type)
        {
            case nameof(CreateTaskCommand):
                if (jsonObject.TryGetProperty("taskDto", out var createTaskDto))
                {
                    var taskDto = JsonSerializer.Deserialize<TaskDto>(createTaskDto.GetRawText(), options);
                    var command = new CreateTaskCommand(taskDto, repository);
                    
                    if (jsonObject.TryGetProperty("createdTask", out var createdTaskElem))
                    {
                        var createdTask = JsonSerializer.Deserialize<ETask>(createdTaskElem.GetRawText(), options);
                        var createdTaskField = command.GetType().GetField("_createdTask", 
                            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                        if (createdTaskField != null)
                        {
                            createdTaskField.SetValue(command, createdTask);
                        }
                    }
                    
                    return command;
                }
                break;

            case nameof(UpdateTaskCommand):
                if (jsonObject.TryGetProperty("taskDto", out var updateTaskDto))
                {
                    var taskDto = JsonSerializer.Deserialize<TaskDto>(updateTaskDto.GetRawText(), options);
                    var command = new UpdateTaskCommand(taskDto, repository);
                    
                    if (jsonObject.TryGetProperty("originalTask", out var originalTaskElem))
                    {
                        var originalTask = JsonSerializer.Deserialize<ETask>(originalTaskElem.GetRawText(), options);
                        var originalTaskField = command.GetType().GetField("_originalTask", 
                            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                        if (originalTaskField != null)
                        {
                            originalTaskField.SetValue(command, originalTask);
                        }
                    }
                    
                    return command;
                }
                break;

            case nameof(DeleteTaskCommand):
                if (jsonObject.TryGetProperty("taskId", out var taskIdElement))
                {
                    var taskId = taskIdElement.GetInt32();
                    var command = new DeleteTaskCommand(taskId, repository);
                    
                    if (jsonObject.TryGetProperty("deletedTasks", out var deletedTasksElem))
                    {
                        var deletedTasks = JsonSerializer.Deserialize<IEnumerable<ETask>>(deletedTasksElem.GetRawText(), options);
                        var deletedTasksField = command.GetType().GetField("_deletedTasks", 
                            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
                        if (deletedTasksField != null)
                        {
                            deletedTasksField.SetValue(command, deletedTasks);
                        }
                    }
                    
                    return command;
                }
                break;
        }

        throw new JsonException($"Невозможно десериализовать команду типа: {type}");
    }
}
       public override void Write(Utf8JsonWriter writer, ICommand value, JsonSerializerOptions options)
{
    writer.WriteStartObject();
    writer.WriteString("type", value.GetType().Name);
    
    if (value is CreateTaskCommand createCmd)
    {
        var taskDtoField = createCmd.GetType().GetField("_taskDto", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (taskDtoField != null)
        {
            var taskDto = taskDtoField.GetValue(createCmd) as TaskDto;
            writer.WritePropertyName("taskDto");
            JsonSerializer.Serialize(writer, taskDto, options);
        }

        var createdTaskField = createCmd.GetType().GetField("_createdTask", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (createdTaskField != null)
        {
            var createdTask = createdTaskField.GetValue(createCmd);
            if (createdTask != null)
            {
                writer.WritePropertyName("createdTask");
                JsonSerializer.Serialize(writer, createdTask, options);
            }
        }
    }
    else if (value is UpdateTaskCommand updateCmd)
    {
        var taskDtoField = updateCmd.GetType().GetField("_taskDto", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (taskDtoField != null)
        {
            var taskDto = taskDtoField.GetValue(updateCmd) as TaskDto;
            writer.WritePropertyName("taskDto");
            JsonSerializer.Serialize(writer, taskDto, options);
        }
        
        var originalTaskField = updateCmd.GetType().GetField("_originalTask", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (originalTaskField != null)
        {
            var originalTask = originalTaskField.GetValue(updateCmd);
            if (originalTask != null)
            {
                writer.WritePropertyName("originalTask");
                JsonSerializer.Serialize(writer, originalTask, options);
            }
        }
    }
    else if (value is DeleteTaskCommand deleteCmd)
    {
        var taskIdField = deleteCmd.GetType().GetField("_taskId", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (taskIdField != null)
        {
            var taskId = (int)taskIdField.GetValue(deleteCmd);
            writer.WriteNumber("taskId", taskId);
        }
        
        var deletedTasksField = deleteCmd.GetType().GetField("_deletedTasks", 
            System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
        if (deletedTasksField != null)
        {
            var deletedTasks = deletedTasksField.GetValue(deleteCmd);
            if (deletedTasks != null)
            {
                writer.WritePropertyName("deletedTasks");
                JsonSerializer.Serialize(writer, deletedTasks, options);
            }
        }
    }
    
    writer.WriteEndObject();
}
    }
}