import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DepartmentService } from '../src/departments/department.service';
import { Department } from '../src/departments/department.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let repo: Repository<Department>;

  const mockDepartment: Department = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    name: 'Engineering',
    description: 'Software engineering',
    employees: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentService,
        { provide: getRepositoryToken(Department), useValue: mockRepository },
      ],
    }).compile();

    service = module.get<DepartmentService>(DepartmentService);
    repo = module.get<Repository<Department>>(getRepositoryToken(Department));

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a department successfully', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockDepartment);
      mockRepository.save.mockResolvedValue(mockDepartment);

      const result = await service.create({ name: 'Engineering', description: 'Software engineering' });
      expect(result).toEqual(mockDepartment);
      expect(mockRepository.create).toHaveBeenCalledWith({ name: 'Engineering', description: 'Software engineering' });
    });

    it('should throw ConflictException if department name exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockDepartment);
      await expect(service.create({ name: 'Engineering' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('should return all departments', async () => {
      mockRepository.find.mockResolvedValue([mockDepartment]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Engineering');
    });
  });

  describe('findOne', () => {
    it('should return a department by id', async () => {
      mockRepository.findOne.mockResolvedValue(mockDepartment);
      const result = await service.findOne(mockDepartment.id);
      expect(result).toEqual(mockDepartment);
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a department', async () => {
      mockRepository.findOne.mockResolvedValue(mockDepartment);
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.save.mockResolvedValue({ ...mockDepartment, name: 'Updated Engineering' });

      const result = await service.update(mockDepartment.id, { name: 'Updated Engineering' });
      expect(result.name).toBe('Updated Engineering');
    });

    it('should throw ConflictException if new name already exists', async () => {
      mockRepository.findOne.mockResolvedValue(mockDepartment);
      mockRepository.findOneBy.mockResolvedValue({ ...mockDepartment, id: 'other-id' });
      await expect(service.update(mockDepartment.id, { name: 'Engineering' }))
        .rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should remove a department', async () => {
      mockRepository.findOne.mockResolvedValue(mockDepartment);
      mockRepository.remove.mockResolvedValue(mockDepartment);

      await expect(service.remove(mockDepartment.id)).resolves.toBeUndefined();
    });

    it('should throw NotFoundException if not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('nonexistent-id'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
